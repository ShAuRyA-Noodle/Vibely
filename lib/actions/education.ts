"use server";

import connectDB from "@/lib/db";
import {
  Education,
  IEducationDocument,
} from "@/models/education.model";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireOnboardedUserProfile } from "./users";

export type EducationDTO = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  grade: string;
  createdAt: string;
};

function serializeEducation(doc: IEducationDocument): EducationDTO {
  return {
    id: doc._id.toString(),
    institution: doc.institution,
    degree: doc.degree || "",
    fieldOfStudy: doc.fieldOfStudy || "",
    startDate: doc.startDate.toISOString(),
    endDate: doc.endDate ? doc.endDate.toISOString() : null,
    current: Boolean(doc.current),
    description: doc.description || "",
    grade: doc.grade || "",
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

export async function getEducationByUser(
  userId: string
): Promise<EducationDTO[]> {
  await connectDB();
  const docs = await Education.find({
    user: new Types.ObjectId(userId),
  }).sort({ current: -1, startDate: -1 });
  return docs.map(serializeEducation);
}

export async function addEducationAction(formData: FormData) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const institution = cleanText(formData.get("institution"), 200);
  if (!institution) throw new Error("Institution is required.");

  const startDate = parseDate(formData.get("startDate"));
  if (!startDate) throw new Error("Start date is required.");

  const current = formData.get("current") === "true";

  await Education.create({
    user: new Types.ObjectId(viewer.id),
    institution,
    degree: cleanText(formData.get("degree"), 100),
    fieldOfStudy: cleanText(formData.get("fieldOfStudy"), 100),
    startDate,
    endDate: current ? undefined : parseDate(formData.get("endDate")),
    current,
    description: cleanText(formData.get("description"), 500),
    grade: cleanText(formData.get("grade"), 50),
  });

  revalidatePath(`/profile/${viewer.handle}`);
}

export async function updateEducationAction(
  educationId: string,
  formData: FormData
) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(educationId))
    throw new Error("Invalid education entry.");

  const doc = await Education.findOne({
    _id: educationId,
    user: new Types.ObjectId(viewer.id),
  });
  if (!doc) throw new Error("Education entry not found.");

  const institution = cleanText(formData.get("institution"), 200);
  if (!institution) throw new Error("Institution is required.");

  const startDate = parseDate(formData.get("startDate"));
  if (!startDate) throw new Error("Start date is required.");

  const current = formData.get("current") === "true";

  doc.institution = institution;
  doc.degree = cleanText(formData.get("degree"), 100);
  doc.fieldOfStudy = cleanText(formData.get("fieldOfStudy"), 100);
  doc.startDate = startDate;
  doc.endDate = current ? undefined : parseDate(formData.get("endDate"));
  doc.current = current;
  doc.description = cleanText(formData.get("description"), 500);
  doc.grade = cleanText(formData.get("grade"), 50);

  await doc.save();
  revalidatePath(`/profile/${viewer.handle}`);
}

export async function deleteEducationAction(educationId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(educationId))
    throw new Error("Invalid education entry.");

  const result = await Education.deleteOne({
    _id: educationId,
    user: new Types.ObjectId(viewer.id),
  });

  if (result.deletedCount === 0)
    throw new Error("Education entry not found.");

  revalidatePath(`/profile/${viewer.handle}`);
}
