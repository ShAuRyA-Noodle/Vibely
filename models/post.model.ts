import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type MediaType = "image" | "video";

export interface IPostMedia {
  type: MediaType;
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  width?: number;
  height?: number;
  duration?: number;
  bytes?: number;
  format?: string;
}

export interface IReactionCounts {
  fire: number;
  heart: number;
  mindblown: number;
  clap: number;
  laugh: number;
  sad: number;
}

export interface IPost {
  author: Types.ObjectId;
  body: string;
  media: IPostMedia[];
  repostOf?: Types.ObjectId;
  quoteText?: string;
  reactions: IReactionCounts;
  totalReactions: number;
  commentCount: number;
  repostCount: number;
  hashtags: string[];
  mentions: string[];
  poll?: {
    options: { text: string; voteCount: number }[];
    totalVotes: number;
    expiresAt?: Date;
    voters: { user: Types.ObjectId; optionIndex: number }[];
  };
  // Moderation
  moderation?: {
    decision: "allow" | "flag" | "block";
    score: number;
    categories: string[];
    checkedAt: Date;
    stages: {
      lexical: string;
      heuristic: string;
      remote: string;
      vision: string;
    };
  };
  isHidden: boolean; // hidden while under report review
  reportCount: number;
  schemaVersion: 2;
}

export interface IPostDocument extends IPost, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<IPostMedia>(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    width: Number,
    height: Number,
    duration: Number,
    bytes: Number,
    format: String,
  },
  { _id: false }
);

const postSchema = new Schema<IPostDocument>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    body: {
      type: String,
      default: "",
      maxlength: 3000,
      trim: true,
    },
    media: {
      type: [mediaSchema],
      default: [],
    },
    repostOf: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      index: true,
    },
    quoteText: {
      type: String,
      default: "",
      maxlength: 1000,
      trim: true,
    },
    reactions: {
      fire: { type: Number, default: 0, min: 0 },
      heart: { type: Number, default: 0, min: 0 },
      mindblown: { type: Number, default: 0, min: 0 },
      clap: { type: Number, default: 0, min: 0 },
      laugh: { type: Number, default: 0, min: 0 },
      sad: { type: Number, default: 0, min: 0 },
    },
    totalReactions: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    repostCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    hashtags: {
      type: [String],
      default: [],
      index: true,
    },
    mentions: {
      type: [String],
      default: [],
    },
    poll: {
      type: {
        options: [
          {
            text: { type: String, required: true, maxlength: 100 },
            voteCount: { type: Number, default: 0 },
          },
        ],
        totalVotes: { type: Number, default: 0 },
        expiresAt: Date,
        voters: [
          {
            user: { type: Schema.Types.ObjectId, ref: "User" },
            optionIndex: Number,
          },
        ],
      },
      default: undefined,
    },
    moderation: {
      type: {
        decision: { type: String, enum: ["allow", "flag", "block"] },
        score: Number,
        categories: [String],
        checkedAt: Date,
        stages: {
          lexical: String,
          heuristic: String,
          remote: String,
          vision: String,
        },
      },
      default: undefined,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    schemaVersion: {
      type: Number,
      default: 2,
      enum: [2],
      index: true,
    },
  },
  { timestamps: true }
);

postSchema.index({ schemaVersion: 1, createdAt: -1 });
postSchema.index(
  { author: 1, repostOf: 1 },
  {
    unique: true,
    partialFilterExpression: {
      repostOf: { $exists: true },
      body: "",
      quoteText: "",
      "media.0": { $exists: false },
    },
  }
);

export const Post: Model<IPostDocument> =
  mongoose.models?.Post || mongoose.model<IPostDocument>("Post", postSchema);
