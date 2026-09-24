import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IComment {
  post: Types.ObjectId;
  author: Types.ObjectId;
  body: string;
  parentComment?: Types.ObjectId;
  replyCount: number;
  depth: number;
}

export interface ICommentDocument extends IComment, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<ICommentDocument>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    body: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    depth: {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
    },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });

export const Comment: Model<ICommentDocument> =
  mongoose.models?.Comment ||
  mongoose.model<ICommentDocument>("Comment", commentSchema);
