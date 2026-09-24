"use server";

import connectDB from "@/lib/db";
import { Conversation } from "@/models/conversation.model";
import { Message } from "@/models/message.model";
import { User } from "@/models/user.model";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireOnboardedUserProfile, serializeUser, UserDTO } from "./users";

export type MessageDTO = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type ConversationDTO = {
  id: string;
  otherUser: UserDTO;
  lastMessageBody: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type ConversationListDTO = {
  conversations: ConversationDTO[];
};

export type MessageListDTO = {
  messages: MessageDTO[];
  nextCursor: string | null;
};

const MESSAGE_LIMIT = 50;

export async function getOrCreateConversation(
  targetUserId: string
): Promise<string> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(targetUserId))
    throw new Error("Invalid user.");
  if (viewer.id === targetUserId)
    throw new Error("Cannot message yourself.");

  const target = await User.findById(targetUserId);
  if (!target || !target.onboardingComplete)
    throw new Error("User not found.");

  // Find existing
  const existing = await Conversation.findOne({
    participants: {
      $all: [
        new Types.ObjectId(viewer.id),
        new Types.ObjectId(targetUserId),
      ],
    },
  });

  if (existing) return existing._id.toString();

  // Create new
  const conv = await Conversation.create({
    participants: [
      new Types.ObjectId(viewer.id),
      new Types.ObjectId(targetUserId),
    ],
    lastMessageAt: new Date(),
    participantMeta: [
      {
        user: new Types.ObjectId(viewer.id),
        unreadCount: 0,
        lastReadAt: new Date(),
      },
      {
        user: new Types.ObjectId(targetUserId),
        unreadCount: 0,
        lastReadAt: new Date(),
      },
    ],
  });

  return conv._id.toString();
}

export async function sendMessageAction(
  conversationId: string,
  body: string
) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(conversationId))
    throw new Error("Invalid conversation.");

  const text = (body || "").trim().slice(0, 2000);
  if (!text) throw new Error("Message cannot be empty.");

  const conv = await Conversation.findOne({
    _id: conversationId,
    participants: new Types.ObjectId(viewer.id),
  });

  if (!conv) throw new Error("Conversation not found.");

  const message = await Message.create({
    conversation: conv._id,
    sender: new Types.ObjectId(viewer.id),
    body: text,
  });

  // Update conversation
  conv.lastMessage = message._id;
  conv.lastMessageAt = message.createdAt;

  // Increment unread for other participant
  for (const meta of conv.participantMeta) {
    if (meta.user.toString() !== viewer.id) {
      meta.unreadCount += 1;
    }
  }
  await conv.save();

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
}

export async function getConversations(): Promise<ConversationListDTO> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const convs = await Conversation.find({
    participants: new Types.ObjectId(viewer.id),
  })
    .sort({ lastMessageAt: -1 })
    .populate("participants")
    .populate("lastMessage");

  const conversations: ConversationDTO[] = [];
  for (const conv of convs) {
    const otherUser = (conv.participants as any[]).find(
      (p: any) => p._id.toString() !== viewer.id
    );
    if (!otherUser) continue;

    const viewerMeta = conv.participantMeta.find(
      (m) => m.user.toString() === viewer.id
    );

    const lastMsg = conv.lastMessage as any;

    conversations.push({
      id: conv._id.toString(),
      otherUser: await serializeUser(otherUser),
      lastMessageBody: lastMsg?.body || "",
      lastMessageAt: conv.lastMessageAt.toISOString(),
      unreadCount: viewerMeta?.unreadCount || 0,
    });
  }

  return { conversations };
}

export async function getMessages(
  conversationId: string,
  cursor?: string
): Promise<MessageListDTO> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(conversationId))
    throw new Error("Invalid conversation.");

  const conv = await Conversation.findOne({
    _id: conversationId,
    participants: new Types.ObjectId(viewer.id),
  });

  if (!conv) throw new Error("Conversation not found.");

  const filter: Record<string, unknown> = {
    conversation: conv._id,
  };
  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(MESSAGE_LIMIT + 1);

  const pageMessages = messages.slice(0, MESSAGE_LIMIT).reverse();

  const nextCursor =
    messages.length > MESSAGE_LIMIT
      ? pageMessages[0]?.createdAt.toISOString()
      : null;

  return {
    messages: pageMessages.map((m) => ({
      id: m._id.toString(),
      senderId: m.sender.toString(),
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
    nextCursor,
  };
}

export async function markConversationReadAction(conversationId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(conversationId))
    throw new Error("Invalid conversation.");

  await Conversation.updateOne(
    {
      _id: conversationId,
      "participantMeta.user": new Types.ObjectId(viewer.id),
    },
    {
      $set: {
        "participantMeta.$.unreadCount": 0,
        "participantMeta.$.lastReadAt": new Date(),
      },
    }
  );

  revalidatePath("/messages");
}

export async function getTotalUnreadMessages(): Promise<number> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const convs = await Conversation.find({
    participants: new Types.ObjectId(viewer.id),
  }).select("participantMeta");

  let total = 0;
  for (const conv of convs) {
    const meta = conv.participantMeta.find(
      (m) => m.user.toString() === viewer.id
    );
    total += meta?.unreadCount || 0;
  }
  return total;
}
