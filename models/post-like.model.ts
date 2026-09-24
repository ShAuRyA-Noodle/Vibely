import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IPostLike {
  post: Types.ObjectId;
  user: Types.ObjectId;
}

export interface IPostLikeDocument extends IPostLike, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postLikeSchema = new Schema<IPostLikeDocument>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

postLikeSchema.index({ post: 1, user: 1 }, { unique: true });

export const PostLike: Model<IPostLikeDocument> =
  mongoose.models?.PostLike ||
  mongoose.model<IPostLikeDocument>("PostLike", postLikeSchema);
