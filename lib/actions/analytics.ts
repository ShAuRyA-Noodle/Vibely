"use server";

import connectDB from "@/lib/db";
import { Impression } from "@/models/impression.model";
import { ProfileView } from "@/models/profile-view.model";
import { Post } from "@/models/post.model";
import { Types } from "mongoose";
import { requireOnboardedUserProfile } from "./users";

export type DashboardStatsDTO = {
  totalImpressions: number;
  profileViewsLast7Days: number;
  profileViewsLast30Days: number;
  totalPosts: number;
  totalReactions: number;
};

export async function recordPostImpression(postId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(postId)) return;

  try {
    await Impression.updateOne(
      {
        post: new Types.ObjectId(postId),
        viewer: new Types.ObjectId(viewer.id),
      },
      {
        $set: { viewedAt: new Date() },
      },
      { upsert: true }
    );
  } catch {
    // duplicate key or other error — ignore
  }
}

export async function recordProfileView(profileUserId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (viewer.id === profileUserId) return; // don't track self-views

  try {
    await ProfileView.create({
      profile: new Types.ObjectId(profileUserId),
      viewer: new Types.ObjectId(viewer.id),
      viewedAt: new Date(),
    });
  } catch {
    // ignore errors
  }
}

export async function getDashboardStats(): Promise<DashboardStatsDTO> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const viewerId = new Types.ObjectId(viewer.id);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  );

  // Get all post IDs by this user
  const userPosts = await Post.find({
    author: viewerId,
    schemaVersion: 2,
  }).select("_id totalReactions");

  const postIds = userPosts.map((p) => p._id);
  const totalReactions = userPosts.reduce(
    (sum, p) => sum + (p.totalReactions || 0),
    0
  );

  const [totalImpressions, profileViews7d, profileViews30d] =
    await Promise.all([
      Impression.countDocuments({ post: { $in: postIds } }),
      ProfileView.countDocuments({
        profile: viewerId,
        viewedAt: { $gte: sevenDaysAgo },
      }),
      ProfileView.countDocuments({
        profile: viewerId,
        viewedAt: { $gte: thirtyDaysAgo },
      }),
    ]);

  return {
    totalImpressions,
    profileViewsLast7Days: profileViews7d,
    profileViewsLast30Days: profileViews30d,
    totalPosts: userPosts.length,
    totalReactions,
  };
}
