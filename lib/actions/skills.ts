"use server";

import connectDB from "@/lib/db";
import { Skill, SkillCategory, ISkillDocument } from "@/models/skill.model";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireOnboardedUserProfile } from "./users";

export type SkillDTO = {
  id: string;
  name: string;
  category: SkillCategory;
};

function serializeSkill(doc: ISkillDocument): SkillDTO {
  return {
    id: doc._id.toString(),
    name: doc.name,
    category: doc.category,
  };
}

const VALID_CATEGORIES: SkillCategory[] = [
  "technical",
  "soft",
  "tool",
  "language",
];

export async function getSkillsByUser(
  userId: string
): Promise<SkillDTO[]> {
  await connectDB();
  const docs = await Skill.find({
    user: new Types.ObjectId(userId),
  }).sort({ category: 1, name: 1 });
  return docs.map(serializeSkill);
}

export async function addSkillAction(name: string, category: SkillCategory) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const cleanName = (name || "").trim().slice(0, 50);
  if (!cleanName) throw new Error("Skill name is required.");
  if (!VALID_CATEGORIES.includes(category))
    throw new Error("Invalid skill category.");

  // Escape regex special chars so user input cannot inject a regex that
  // matches every row or triggers catastrophic backtracking.
  const escaped = cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existing = await Skill.findOne({
    user: new Types.ObjectId(viewer.id),
    name: { $regex: new RegExp(`^${escaped}$`, "i") },
  });
  if (existing) throw new Error("You already have this skill.");

  await Skill.create({
    user: new Types.ObjectId(viewer.id),
    name: cleanName,
    category,
  });

  revalidatePath(`/profile/${viewer.handle}`);
}

export async function removeSkillAction(skillId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(skillId))
    throw new Error("Invalid skill.");

  const result = await Skill.deleteOne({
    _id: skillId,
    user: new Types.ObjectId(viewer.id),
  });

  if (result.deletedCount === 0) throw new Error("Skill not found.");

  revalidatePath(`/profile/${viewer.handle}`);
}
