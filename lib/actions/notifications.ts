"use server";

import connectDB from "@/lib/db";
import {
  Notification,
  NotificationType,
} from "@/models/notification.model";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireOnboardedUserProfile, serializeUser, UserDTO } from "./users";

export type NotificationDTO = {
  id: string;
  actor: UserDTO;
  type: NotificationType;
  postId: string | null;
  commentId: string | null;
  connectionId: string | null;
  read: boolean;
  createdAt: string;
};

export type NotificationFeedDTO = {
  notifications: NotificationDTO[];
  nextCursor: string | null;
};

const NOTIF_LIMIT = 20;

// Internal helper — not exported as server action, called from other actions
export async function createNotification(data: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  connectionId?: string;
}) {
  // Don't notify yourself
  if (data.recipientId === data.actorId) return;

  await connectDB();
  await Notification.create({
    recipient: new Types.ObjectId(data.recipientId),
    actor: new Types.ObjectId(data.actorId),
    type: data.type,
    post: data.postId ? new Types.ObjectId(data.postId) : undefined,
    comment: data.commentId
      ? new Types.ObjectId(data.commentId)
      : undefined,
    connection: data.connectionId
      ? new Types.ObjectId(data.connectionId)
      : undefined,
    read: false,
  });
}

export async function getNotifications(
  cursor?: string,
  limit = NOTIF_LIMIT
): Promise<NotificationFeedDTO> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const filter: Record<string, unknown> = {
    recipient: new Types.ObjectId(viewer.id),
  };
  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate("actor");

  const page = notifications.slice(0, limit);

  const serialized: NotificationDTO[] = [];
  for (const n of page) {
    serialized.push({
      id: n._id.toString(),
      actor: await serializeUser(n.actor as any),
      type: n.type,
      postId: n.post?.toString() || null,
      commentId: n.comment?.toString() || null,
      connectionId: n.connection?.toString() || null,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    });
  }

  const nextCursor =
    notifications.length > limit
      ? page[page.length - 1]?.createdAt.toISOString()
      : null;

  return { notifications: serialized, nextCursor };
}

export async function markNotificationReadAction(notificationId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(notificationId))
    throw new Error("Invalid notification.");

  await Notification.updateOne(
    {
      _id: notificationId,
      recipient: new Types.ObjectId(viewer.id),
    },
    { $set: { read: true } }
  );

  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  await Notification.updateMany(
    {
      recipient: new Types.ObjectId(viewer.id),
      read: false,
    },
    { $set: { read: true } }
  );

  revalidatePath("/notifications");
}

export async function getUnreadCount(): Promise<number> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  return Notification.countDocuments({
    recipient: new Types.ObjectId(viewer.id),
    read: false,
  });
}
