"use server";

import connectDB from "@/lib/db";
import { Follow } from "@/models/follow.model";
import { Post } from "@/models/post.model";
import { IUserDocument, User } from "@/models/user.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { getEducationByUser } from "./education";
import { getExperienceByUser } from "./experience";
import { getSkillsByUser } from "./skills";

export type UserDTO = {
  id: string;
  clerkId: string;
  email: string;
  handle: string;
  firstName: string;
  lastName: string;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  headline: string;
  bio: string;
  location: string;
  website: string;
  institution: string;
  department: string;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProfileDTO = UserDTO & {
  subscriberCount: number;
  subscribingCount: number;
  postCount: number;
  isSelf: boolean;
  isSubscribed: boolean;
  education: import("./education").EducationDTO[];
  experience: import("./experience").ExperienceDTO[];
  skills: import("./skills").SkillDTO[];
};

export type ProfileStatsDTO = {
  subscriberCount: number;
  subscribingCount: number;
  postCount: number;
};

const DEFAULT_AVATAR = "/default-avatar.png";
const DEFAULT_BANNER = "/banner.jpg";

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeHandle(value: string) {
  const handle = value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .slice(0, 24);

  return handle || "vibely";
}

function nameFromParts(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim() || "Vibely Member";
}

function getPrimaryEmail(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  if (!clerkUser) return "";
  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId
  );

  return primaryEmail?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || "";
}

async function createUniqueHandle(baseValue: string, clerkId: string) {
  const baseHandle = normalizeHandle(baseValue);
  let candidate = baseHandle;
  let attempt = 0;

  while (await User.exists({ handle: candidate, clerkId: { $ne: clerkId } })) {
    attempt += 1;
    candidate = normalizeHandle(`${baseHandle}${attempt}`);
  }

  return candidate;
}

export async function serializeUser(user: IUserDocument): Promise<UserDTO> {
  return {
    id: user._id.toString(),
    clerkId: user.clerkId,
    email: user.email,
    handle: user.handle,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    avatarUrl: user.avatarUrl || DEFAULT_AVATAR,
    bannerUrl: user.bannerUrl || DEFAULT_BANNER,
    headline: user.headline || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    institution: user.institution || "",
    department: user.department || "",
    onboardingComplete: Boolean(user.onboardingComplete),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function getCurrentUserProfile() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  await connectDB();

  const user = await User.findOne({ clerkId: clerkUser.id });
  if (!user) return null;

  return serializeUser(user);
}

export async function ensureUserProfile() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  await connectDB();

  const email = getPrimaryEmail(clerkUser);
  const firstName = (clerkUser.firstName || "Vibely").trim();
  const lastName = (clerkUser.lastName || "").trim();
  const name = nameFromParts(firstName, lastName);
  const handleBase =
    clerkUser.username || email.split("@")[0] || `${firstName}${lastName}`;

  const existingUser = await User.findOne({ clerkId: clerkUser.id });
  if (existingUser) {
    existingUser.email = email || existingUser.email;
    existingUser.firstName = firstName;
    existingUser.lastName = lastName;
    existingUser.name = name;
    existingUser.avatarUrl = clerkUser.imageUrl || existingUser.avatarUrl || DEFAULT_AVATAR;

    if (!existingUser.handle) {
      existingUser.handle = await createUniqueHandle(handleBase, clerkUser.id);
    }

    await existingUser.save();
    return serializeUser(existingUser);
  }

  const handle = await createUniqueHandle(handleBase, clerkUser.id);
  const user = await User.create({
    clerkId: clerkUser.id,
    email: email || `${clerkUser.id}@vibely.local`,
    handle,
    firstName,
    lastName,
    name,
    avatarUrl: clerkUser.imageUrl || DEFAULT_AVATAR,
    bannerUrl: DEFAULT_BANNER,
    headline: "",
    bio: "",
    location: "",
    website: "",
    onboardingComplete: false,
  });

  return serializeUser(user);
}

export async function requireUserProfile() {
  const user = await ensureUserProfile();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireOnboardedUserProfile() {
  const user = await requireUserProfile();
  if (!user.onboardingComplete) redirect("/onboarding");
  return user;
}

export async function completeOnboardingAction(formData: FormData) {
  const user = await requireUserProfile();
  await connectDB();

  const requestedHandle = normalizeHandle(cleanText(formData.get("handle"), 24));

  // Only check handle uniqueness if the user is changing to a DIFFERENT handle
  if (requestedHandle !== user.handle) {
    const conflict = await User.findOne({ handle: requestedHandle });
    if (conflict) {
      throw new Error("That handle is already taken.");
    }
  }

  await User.updateOne(
    { _id: new Types.ObjectId(user.id) },
    {
      $set: {
        handle: requestedHandle,
        headline: cleanText(formData.get("headline"), 140),
        bio: cleanText(formData.get("bio"), 500),
        location: cleanText(formData.get("location"), 100),
        website: cleanText(formData.get("website"), 180),
        institution: cleanText(formData.get("institution"), 200),
        department: cleanText(formData.get("department"), 100),
        onboardingComplete: true,
      },
    }
  );

  revalidatePath("/");
  revalidatePath("/feed");
  redirect("/feed");
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireOnboardedUserProfile();
  await connectDB();

  const requestedHandle = normalizeHandle(cleanText(formData.get("handle"), 24));

  if (requestedHandle !== user.handle) {
    const conflict = await User.findOne({ handle: requestedHandle });
    if (conflict) {
      throw new Error("That handle is already taken.");
    }
  }

  await User.updateOne(
    { _id: new Types.ObjectId(user.id) },
    {
      $set: {
        handle: requestedHandle,
        headline: cleanText(formData.get("headline"), 140),
        bio: cleanText(formData.get("bio"), 500),
        location: cleanText(formData.get("location"), 100),
        website: cleanText(formData.get("website"), 180),
        institution: cleanText(formData.get("institution"), 200),
        department: cleanText(formData.get("department"), 100),
      },
    }
  );

  revalidatePath("/feed");
  revalidatePath(`/profile/${requestedHandle}`);
  redirect(`/profile/${requestedHandle}`);
}

export async function getProfileStats(userId: string): Promise<ProfileStatsDTO> {
  await connectDB();
  const objectId = new Types.ObjectId(userId);
  const [subscriberCount, subscribingCount, postCount] = await Promise.all([
    Follow.countDocuments({ following: objectId }),
    Follow.countDocuments({ follower: objectId }),
    Post.countDocuments({ author: objectId, schemaVersion: 2 }),
  ]);

  return { subscriberCount, subscribingCount, postCount };
}

export async function getProfileByHandle(handle: string): Promise<ProfileDTO | null> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const profile = await User.findOne({
    handle: normalizeHandle(handle),
    onboardingComplete: true,
  });

  if (!profile) return null;

  const profileId = profile._id.toString();
  const [stats, subscription, education, experience, skills] =
    await Promise.all([
      getProfileStats(profileId),
      Follow.exists({
        follower: new Types.ObjectId(viewer.id),
        following: profile._id,
      }),
      getEducationByUser(profileId),
      getExperienceByUser(profileId),
      getSkillsByUser(profileId),
    ]);

  return {
    ...(await serializeUser(profile)),
    ...stats,
    isSelf: viewer.id === profileId,
    isSubscribed: Boolean(subscription),
    education,
    experience,
    skills,
  };
}

export async function getSuggestedProfiles(limit = 4): Promise<ProfileDTO[]> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const following = await Follow.find({ follower: viewer.id }).select("following");
  const excludedIds = [
    new Types.ObjectId(viewer.id),
    ...following.map((follow) => follow.following),
  ];

  const users = await User.find({
    _id: { $nin: excludedIds },
    onboardingComplete: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  const profiles = await Promise.all(
    users.map(async (user) => {
      const uid = user._id.toString();
      return {
        ...(await serializeUser(user)),
        ...(await getProfileStats(uid)),
        isSelf: false,
        isSubscribed: false,
        education: await getEducationByUser(uid),
        experience: await getExperienceByUser(uid),
        skills: await getSkillsByUser(uid),
      };
    })
  );

  return profiles;
}
