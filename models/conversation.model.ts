import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IParticipantMeta {
  user: Types.ObjectId;
  unreadCount: number;
  lastReadAt: Date;
}

export interface IConversation {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  lastMessageAt: Date;
  participantMeta: IParticipantMeta[];
}

export interface IConversationDocument extends IConversation, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const participantMetaSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    unreadCount: { type: Number, default: 0 },
    lastReadAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversationDocument>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: {
        validator: (v: Types.ObjectId[]) => v.length === 2,
        message: "Conversations must have exactly 2 participants.",
      },
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    participantMeta: {
      type: [participantMetaSchema],
      default: [],
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation: Model<IConversationDocument> =
  mongoose.models?.Conversation ||
  mongoose.model<IConversationDocument>("Conversation", conversationSchema);
