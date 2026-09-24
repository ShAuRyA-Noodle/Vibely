"use server";

import connectDB from "@/lib/db";
import { Connection } from "@/models/connection.model";
import { Follow } from "@/models/follow.model";
import { User } from "@/models/user.model";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireOnboardedUserProfile, serializeUser, UserDTO } from "./users";
import { createNotification } from "./notifications";

export type ConnectionDTO = {
  id: string;
  user: UserDTO;
  status: "pending" | "accepted" | "declined";
  note: string;
  direction: "sent" | "received";
  createdAt: string;
};

export type SuggestionDTO = {
  user: UserDTO;
  reason: string;
};

export async function sendConnectionRequestAction(
  targetUserId: string,
  note = ""
) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(targetUserId))
    throw new Error("Invalid user.");
  if (viewer.id === targetUserId)
    throw new Error("You cannot connect with yourself.");

  const target = await User.findById(targetUserId);
  if (!target || !target.onboardingComplete)
    throw new Error("User not found.");

  // Check for existing connection in either direction
  const existing = await Connection.findOne({
    $or: [
      { requester: viewer.id, recipient: targetUserId },
      { requester: targetUserId, recipient: viewer.id },
    ],
  });

  if (existing) {
    if (existing.status === "accepted")
      throw new Error("You are already connected.");
    if (existing.status === "pending")
      throw new Error("A connection request already exists.");
    // If declined, allow re-request
    if (existing.status === "declined") {
      existing.requester = new Types.ObjectId(viewer.id);
      existing.recipient = new Types.ObjectId(targetUserId);
      existing.status = "pending";
      existing.note = (note || "").trim().slice(0, 300);
      await existing.save();
    }
  } else {
    await Connection.create({
      requester: new Types.ObjectId(viewer.id),
      recipient: new Types.ObjectId(targetUserId),
      status: "pending",
      note: (note || "").trim().slice(0, 300),
    });
  }

  await createNotification({
    recipientId: targetUserId,
    actorId: viewer.id,
    type: "connection_request",
  });

  revalidatePath("/connections");
  revalidatePath(`/profile/${target.handle}`);
}

export async function acceptConnectionAction(connectionId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(connectionId))
    throw new Error("Invalid connection.");

  const conn = await Connection.findOne({
    _id: connectionId,
    recipient: new Types.ObjectId(viewer.id),
    status: "pending",
  });

  if (!conn) throw new Error("Connection request not found.");

  conn.status = "accepted";
  await conn.save();

  // Auto-create mutual follows
  const followPairs = [
    { follower: conn.requester, following: conn.recipient },
    { follower: conn.recipient, following: conn.requester },
  ];
  for (const pair of followPairs) {
    await Follow.updateOne(pair, pair, { upsert: true });
  }

  await createNotification({
    recipientId: conn.requester.toString(),
    actorId: viewer.id,
    type: "connection_accept",
    connectionId: conn._id.toString(),
  });

  revalidatePath("/connections");
  revalidatePath("/feed");
}

export async function declineConnectionAction(connectionId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(connectionId))
    throw new Error("Invalid connection.");

  const conn = await Connection.findOne({
    _id: connectionId,
    recipient: new Types.ObjectId(viewer.id),
    status: "pending",
  });

  if (!conn) throw new Error("Connection request not found.");

  conn.status = "declined";
  await conn.save();

  revalidatePath("/connections");
}

export async function removeConnectionAction(connectionId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(connectionId))
    throw new Error("Invalid connection.");

  const conn = await Connection.findOne({
    _id: connectionId,
    status: "accepted",
    $or: [
      { requester: new Types.ObjectId(viewer.id) },
      { recipient: new Types.ObjectId(viewer.id) },
    ],
  });

  if (!conn) throw new Error("Connection not found.");
  await conn.deleteOne();

  revalidatePath("/connections");
}

export async function getConnectionRequests(): Promise<ConnectionDTO[]> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const requests = await Connection.find({
    recipient: new Types.ObjectId(viewer.id),
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .populate("requester");

  const result: ConnectionDTO[] = [];
  for (const r of requests) {
    result.push({
      id: r._id.toString(),
      user: await serializeUser(r.requester as any),
      status: r.status,
      note: r.note || "",
      direction: "received",
      createdAt: r.createdAt.toISOString(),
    });
  }
  return result;
}

export async function getConnections(
  userId?: string
): Promise<ConnectionDTO[]> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const targetId = userId || viewer.id;

  const connections = await Connection.find({
    status: "accepted",
    $or: [
      { requester: new Types.ObjectId(targetId) },
      { recipient: new Types.ObjectId(targetId) },
    ],
  })
    .sort({ updatedAt: -1 })
    .populate("requester recipient");

  const result: ConnectionDTO[] = [];
  for (const c of connections) {
    const otherUser =
      c.requester._id.toString() === targetId
        ? c.recipient
        : c.requester;
    result.push({
      id: c._id.toString(),
      user: await serializeUser(otherUser as any),
      status: c.status,
      note: c.note || "",
      direction:
        c.requester._id.toString() === targetId ? "sent" : "received",
      createdAt: c.createdAt.toISOString(),
    });
  }
  return result;
}

export async function getConnectionStatus(
  targetUserId: string
): Promise<"none" | "pending_sent" | "pending_received" | "connected"> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const conn = await Connection.findOne({
    $or: [
      { requester: viewer.id, recipient: targetUserId },
      { requester: targetUserId, recipient: viewer.id },
    ],
    status: { $in: ["pending", "accepted"] },
  });

  if (!conn) return "none";
  if (conn.status === "accepted") return "connected";
  if (conn.requester.toString() === viewer.id) return "pending_sent";
  return "pending_received";
}

export async function getSuggestedConnections(
  limit = 6
): Promise<SuggestionDTO[]> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  // Get existing connections and requests
  const existingConnections = await Connection.find({
    $or: [
      { requester: new Types.ObjectId(viewer.id) },
      { recipient: new Types.ObjectId(viewer.id) },
    ],
    status: { $in: ["pending", "accepted"] },
  });

  const excludeIds = new Set<string>([viewer.id]);
  for (const c of existingConnections) {
    excludeIds.add(c.requester.toString());
    excludeIds.add(c.recipient.toString());
  }

  const excludeObjectIds = Array.from(excludeIds).map(
    (id) => new Types.ObjectId(id)
  );

  // Get viewer's profile for institution matching
  const viewerProfile = await User.findById(viewer.id);
  const viewerInstitution = viewerProfile?.institution || "";

  // Find suggestions
  const users = await User.find({
    _id: { $nin: excludeObjectIds },
    onboardingComplete: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit * 2); // fetch more to allow filtering

  const suggestions: SuggestionDTO[] = [];
  for (const user of users) {
    if (suggestions.length >= limit) break;

    let reason = "Active on Vibely";
    if (
      viewerInstitution &&
      user.institution &&
      user.institution.toLowerCase() === viewerInstitution.toLowerCase()
    ) {
      reason = `Same institution: ${user.institution}`;
    }

    suggestions.push({
      user: await serializeUser(user),
      reason,
    });
  }

  return suggestions;
}
