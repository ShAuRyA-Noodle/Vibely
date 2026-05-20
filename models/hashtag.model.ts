import mongoose, { Document, Model, Schema } from "mongoose";

export interface IHashtag {
  name: string;
  postCount: number;
  lastUsedAt: Date;
}

export interface IHashtagDocument extends IHashtag, Document {
  createdAt: Date;
  updatedAt: Date;
}

const hashtagSchema = new Schema<IHashtagDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    postCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

hashtagSchema.index({ postCount: -1 });

export const Hashtag: Model<IHashtagDocument> =
  mongoose.models?.Hashtag ||
  mongoose.model<IHashtagDocument>("Hashtag", hashtagSchema);
