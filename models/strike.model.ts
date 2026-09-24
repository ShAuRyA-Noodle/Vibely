import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type StrikeSeverity = "warning" | "minor" | "major";
export type StrikeSource = "auto_moderation" | "report_review" | "manual_admin";

export interface IStrike {
  user: Types.ObjectId;
  issuedBy?: Types.ObjectId;
  post?: Types.ObjectId;
  report?: Types.ObjectId;
  severity: StrikeSeverity;
  source: StrikeSource;
  reason: string;
  categories: string[];
  expiresAt?: Date; // null = permanent
}

export interface IStrikeDocument extends IStrike, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const strikeSchema = new Schema<IStrikeDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User" },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    report: { type: Schema.Types.ObjectId, ref: "Report" },
    severity: {
      type: String,
      enum: ["warning", "minor", "major"],
      required: true,
    },
    source: {
      type: String,
      enum: ["auto_moderation", "report_review", "manual_admin"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    expiresAt: Date,
  },
  { timestamps: true }
);

export const Strike: Model<IStrikeDocument> =
  mongoose.models?.Strike ||
  mongoose.model<IStrikeDocument>("Strike", strikeSchema);
