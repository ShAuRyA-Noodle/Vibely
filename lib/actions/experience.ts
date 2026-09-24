"use server";

import connectDB from "@/lib/db";
import {
  Experience,
  ExperienceType,
  IExperienceDocument,
} from "@/models/experience.model";
import { IPostMedia } from "@/models/post.model";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireOnboardedUserProfile } from "./users";

export type ExperienceDTO = {
  id: string;
  type: ExperienceType;
  title: string;
  organization: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  skills: string[];
  media: IPostMedia[];
  projectUrl: string;
  createdAt: string;
};

function serializeMedia(media: unknown[]): IPostMedia[] {
  return (media || []).map((m: any) => (m.toJSON ? m.toJSON() : m));
}

function serializeExperience(doc: IExperienceDocument): ExperienceDTO {
  return {
    id: doc._id.toString(),
    type: doc.type,
    title: doc.title,
    organization: doc.organization || "",
    startDate: doc.startDate.toISOString(),
    endDate: doc.endDate ? doc.endDate.toISOString() : null,
    current: Boolean(doc.current),
    description: doc.description || "",
    skills: doc.skills || [],
    media: serializeMedia(doc.media),
    projectUrl: doc.projectUrl || "",
    createdAt: doc.createdAt.toISOString(),
  };
}

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function parseDate(value: FormDataEntryValue | null): Date | undefined {
  const str = String(value || "").trim();
  if (!str) return undefined;
  const d = new Date(str);
  if (isNaN(d.getTime())) return undefined;
  return d;
}

const VALID_TYPES: ExperienceType[] = [
  "work",
  "project",
  "research",
  "volunteer",
];

export async function getExperienceByUser(
  userId: string
): Promise<ExperienceDTO[]> {
  await connectDB();
  const docs = await Experience.find({
    user: new Types.ObjectId(userId),
  }).sort({ current: -1, startDate: -1 });
  return docs.map(serializeExperience);
}

export async function addExperienceAction(input: {
  type: ExperienceType;
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  skills: string[];
  media: IPostMedia[];
  projectUrl: string;
}) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!input.title.trim()) throw new Error("Title is required.");
  if (!VALID_TYPES.includes(input.type))
    throw new Error("Invalid experience type.");

  const startDate = new Date(input.startDate);
  if (isNaN(startDate.getTime())) throw new Error("Invalid start date.");

  const skills = (input.skills || [])
    .map((s) => s.trim().slice(0, 50))
    .filter(Boolean)
    .slice(0, 10);

  const media = (input.media || []).slice(0, 3);

  await Experience.create({
    user: new Types.ObjectId(viewer.id),
    type: input.type,
    title: input.title.trim().slice(0, 150),
    organization: (input.organization || "").trim().slice(0, 200),
    startDate,
    endDate:
      input.current || !input.endDate
        ? undefined
        : new Date(input.endDate),
    current: Boolean(input.current),
    description: (input.description || "").trim().slice(0, 1000),
    skills,
    media,
    projectUrl: (input.projectUrl || "").trim().slice(0, 300),
  });

  revalidatePath(`/profile/${viewer.handle}`);
}

export async function updateExperienceAction(
  experienceId: string,
  input: {
    type: ExperienceType;
    title: string;
    organization: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    skills: string[];
    media: IPostMedia[];
    projectUrl: string;
  }
) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(experienceId))
    throw new Error("Invalid experience entry.");

  const doc = await Experience.findOne({
    _id: experienceId,
    user: new Types.ObjectId(viewer.id),
  });
  if (!doc) throw new Error("Experience entry not found.");

  if (!input.title.trim()) throw new Error("Title is required.");
  if (!VALID_TYPES.includes(input.type))
    throw new Error("Invalid experience type.");

  const startDate = new Date(input.startDate);
  if (isNaN(startDate.getTime())) throw new Error("Invalid start date.");

  doc.type = input.type;
  doc.title = input.title.trim().slice(0, 150);
  doc.organization = (input.organization || "").trim().slice(0, 200);
  doc.startDate = startDate;
  doc.endDate =
    input.current || !input.endDate
      ? undefined
      : new Date(input.endDate);
  doc.current = Boolean(input.current);
  doc.description = (input.description || "").trim().slice(0, 1000);
  doc.skills = (input.skills || [])
    .map((s) => s.trim().slice(0, 50))
    .filter(Boolean)
    .slice(0, 10);
  doc.media = (input.media || []).slice(0, 3) as any;
  doc.projectUrl = (input.projectUrl || "").trim().slice(0, 300);

  await doc.save();
  revalidatePath(`/profile/${viewer.handle}`);
}

export async function deleteExperienceAction(experienceId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(experienceId))
    throw new Error("Invalid experience entry.");

  const result = await Experience.deleteOne({
    _id: experienceId,
    user: new Types.ObjectId(viewer.id),
  });

  if (result.deletedCount === 0)
    throw new Error("Experience entry not found.");

  revalidatePath(`/profile/${viewer.handle}`);
}
