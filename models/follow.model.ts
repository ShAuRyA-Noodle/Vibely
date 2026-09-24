import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IFollow {
  follower: Types.ObjectId;
  following: Types.ObjectId;
}

export interface IFollowDocument extends IFollow, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<IFollowDocument>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follow: Model<IFollowDocument> =
  mongoose.models?.Follow ||
  mongoose.model<IFollowDocument>("Follow", followSchema);
