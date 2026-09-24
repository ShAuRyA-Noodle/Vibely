import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IUser {
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
  // Moderation
  role: "user" | "moderator" | "admin";
  isBanned: boolean;
  bannedAt?: Date;
  banReason?: string;
  strikeCount: number;
  restrictedUntil?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    handle: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "/default-avatar.png",
    },
    bannerUrl: {
      type: String,
      default: "/banner.jpg",
    },
    headline: {
      type: String,
      default: "",
      maxlength: 140,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },
    location: {
      type: String,
      default: "",
      maxlength: 100,
      trim: true,
    },
    website: {
      type: String,
      default: "",
      maxlength: 180,
      trim: true,
    },
    institution: {
      type: String,
      default: "",
      maxlength: 200,
      trim: true,
    },
    department: {
      type: String,
      default: "",
      maxlength: 100,
      trim: true,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
      index: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
      index: true,
    },
    bannedAt: Date,
    banReason: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    strikeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    restrictedUntil: Date,
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> =
  mongoose.models?.User || mongoose.model<IUserDocument>("User", userSchema);
