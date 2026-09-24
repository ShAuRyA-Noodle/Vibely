import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IImpression {
  post: Types.ObjectId;
  viewer: Types.ObjectId;
  viewedAt: Date;
}

export interface IImpressionDocument extends IImpression, Document {
  _id: Types.ObjectId;
}

const impressionSchema = new Schema<IImpressionDocument>({
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
    index: true,
  },
  viewer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
});

impressionSchema.index({ post: 1, viewer: 1 }, { unique: true });

export const Impression: Model<IImpressionDocument> =
  mongoose.models?.Impression ||
  mongoose.model<IImpressionDocument>("Impression", impressionSchema);
