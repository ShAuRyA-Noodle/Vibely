import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type SkillCategory = "technical" | "soft" | "tool" | "language";

export interface ISkill {
  user: Types.ObjectId;
  name: string;
  category: SkillCategory;
}

export interface ISkillDocument extends ISkill, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkillDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    category: {
      type: String,
      enum: ["technical", "soft", "tool", "language"],
      required: true,
    },
  },
  { timestamps: true }
);

skillSchema.index({ name: 1 });
skillSchema.index({ user: 1, name: 1 }, { unique: true });

export const Skill: Model<ISkillDocument> =
  mongoose.models?.Skill ||
  mongoose.model<ISkillDocument>("Skill", skillSchema);
