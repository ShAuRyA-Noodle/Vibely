"use server";

import connectDB from "@/lib/db";
import { Follow } from "@/models/follow.model";
import { User } from "@/models/user.model";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { requireOnboardedUserProfile } from "./users";
import { createNotification } from "./notifications";

export async function toggleFollowAction(targetUserId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(targetUserId)) {
    throw new Error("Invalid profile.");
  }

  if (viewer.id === targetUserId) {
    throw new Error("You cannot subscribe to yourself.");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser || !targetUser.onboardingComplete) {
    throw new Error("Profile not found.");
  }

  const follower = new Types.ObjectId(viewer.id);
  const following = new Types.ObjectId(targetUserId);
  const existingFollow = await Follow.findOne({ follower, following });

  if (existingFollow) {
    await existingFollow.deleteOne();
  } else {
    await Follow.create({ follower, following });
    await createNotification({
      recipientId: targetUserId,
      actorId: viewer.id,
      type: "follow",
    });
  }

  revalidatePath("/feed");
  revalidatePath(`/profile/${targetUser.handle}`);
  revalidatePath(`/profile/${viewer.handle}`);
}
