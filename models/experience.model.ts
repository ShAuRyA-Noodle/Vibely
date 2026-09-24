import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { IPostMedia } from "./post.model";

export type ExperienceType = "work" | "project" | "research" | "volunteer";

export interface IExperience {
  user: Types.ObjectId;
  type: ExperienceType;
  title: string;
  organization: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  skills: string[];
  media: IPostMedia[];
  projectUrl: string;
}

export interface IExperienceDocument extends IExperience, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const experienceMediaSchema = new Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: { type: String, enum: ["image", "video"], required: true },
    width: Number,
    height: Number,
    duration: Number,
    bytes: Number,
    format: String,
  },
  { _id: false }
);

const experienceSchema = new Schema<IExperienceDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["work", "project", "research", "volunteer"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 150,
      trim: true,
    },
    organization: {
      type: String,
      default: "",
      maxlength: 200,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) =>
          v.length <= 10 && v.every((s) => s.length <= 50),
        message: "Maximum 10 skills, each up to 50 characters.",
      },
    },
    media: {
      type: [experienceMediaSchema],
      default: [],
      validate: {
        validator: (v: unknown[]) => v.length <= 3,
        message: "Maximum 3 media items per experience.",
      },
    },
    projectUrl: {
      type: String,
      default: "",
      maxlength: 300,
      trim: true,
    },
  },
  { timestamps: true }
);

experienceSchema.index({ user: 1, type: 1, startDate: -1 });

export const Experience: Model<IExperienceDocument> =
  mongoose.models?.Experience ||
  mongoose.model<IExperienceDocument>("Experience", experienceSchema);
