import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ReportReason =
  | "spam"
  | "harassment"
  | "hateSpeech"
  | "sexual"
  | "violence"
  | "selfHarm"
  | "misinformation"
  | "impersonation"
  | "intellectualProperty"
  | "other";

export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

export type ReportResolution =
  | "no_action"
  | "content_removed"
  | "user_warned"
  | "user_struck"
  | "user_banned";

export interface IReport {
  post: Types.ObjectId;
  reporter: Types.ObjectId;
  reportedUser: Types.ObjectId;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  resolution?: ReportResolution;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  reviewerNote?: string;
}

export interface IReportDocument extends IReport, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReportDocument>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "hateSpeech",
        "sexual",
        "violence",
        "selfHarm",
        "misinformation",
        "impersonation",
        "intellectualProperty",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    resolution: {
      type: String,
      enum: [
        "no_action",
        "content_removed",
        "user_warned",
        "user_struck",
        "user_banned",
      ],
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,
    reviewerNote: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

// One report per (reporter, post) pair
reportSchema.index({ post: 1, reporter: 1 }, { unique: true });
// Fast admin queue
reportSchema.index({ status: 1, createdAt: -1 });

export const Report: Model<IReportDocument> =
  mongoose.models?.Report ||
  mongoose.model<IReportDocument>("Report", reportSchema);
