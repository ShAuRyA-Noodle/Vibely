import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IMessage {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  body: string;
  createdAt: Date;
}

export interface IMessageDocument extends IMessage, Document {
  _id: Types.ObjectId;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessageDocument>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

export const Message: Model<IMessageDocument> =
  mongoose.models?.Message ||
  mongoose.model<IMessageDocument>("Message", messageSchema);
