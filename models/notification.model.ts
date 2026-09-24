import mongoose, { Document, Model, Schema, Types } from "mongoose";

export const NOTIFICATION_TYPES = [
  "reaction",
  "comment",
  "reply",
  "follow",
  "connection_request",
  "connection_accept",
  "mention",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification {
  recipient: Types.ObjectId;
  actor: Types.ObjectId;
  type: NotificationType;
  post?: Types.ObjectId;
  comment?: Types.ObjectId;
  connection?: Types.ObjectId;
  read: boolean;
}

export interface INotificationDocument extends INotification, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    connection: {
      type: Schema.Types.ObjectId,
      ref: "Connection",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification: Model<INotificationDocument> =
  mongoose.models?.Notification ||
  mongoose.model<INotificationDocument>("Notification", notificationSchema);
