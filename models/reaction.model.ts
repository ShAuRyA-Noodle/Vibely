import mongoose, { Document, Model, Schema, Types } from "mongoose";

export const REACTION_TYPES = [
  "fire",
  "heart",
  "mindblown",
  "clap",
  "laugh",
  "sad",
] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];

export interface IReaction {
  post: Types.ObjectId;
  user: Types.ObjectId;
  type: ReactionType;
}

export interface IReactionDocument extends IReaction, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<IReactionDocument>(
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
    type: {
      type: String,
      enum: REACTION_TYPES,
      required: true,
    },
  },
  { timestamps: true }
);

reactionSchema.index({ post: 1, user: 1 }, { unique: true });
reactionSchema.index({ post: 1, type: 1 });

export const Reaction: Model<IReactionDocument> =
  mongoose.models?.Reaction ||
  mongoose.model<IReactionDocument>("Reaction", reactionSchema);
