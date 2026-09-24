"use server";

import connectDB from "@/lib/db";
import { Hashtag } from "@/models/hashtag.model";
import { Post } from "@/models/post.model";
import { User } from "@/models/user.model";
import { Types } from "mongoose";
import {
  requireOnboardedUserProfile,
  serializeUser,
  UserDTO,
} from "./users";
import {
  FeedDTO,
  PostDTO,
} from "./posts";
import { Reaction, ReactionType } from "@/models/reaction.model";
import { Comment } from "@/models/comment.model";

export type HashtagDTO = {
  name: string;
  postCount: number;
};

const SEARCH_LIMIT = 12;

// Ensure text indexes exist (called lazily)
let indexesEnsured = false;
async function ensureTextIndexes() {
  if (indexesEnsured) return;
  try {
    await User.collection.createIndex(
      {
        name: "text",
        handle: "text",
        headline: "text",
        bio: "text",
        institution: "text",
      },
      { name: "user_text_search", weights: { name: 10, handle: 8, headline: 5, institution: 3, bio: 1 } }
    );
  } catch {
    // index may already exist
  }
  try {
    await Post.collection.createIndex(
      { body: "text", quoteText: "text" },
      { name: "post_text_search" }
    );
  } catch {
    // index may already exist
  }
  indexesEnsured = true;
}

export async function searchUsers(
  query: string,
  limit = 10
): Promise<UserDTO[]> {
  await requireOnboardedUserProfile();
  await connectDB();
  await ensureTextIndexes();

  const trimmed = query.trim();
  if (!trimmed) return [];

  // Try text search first, fall back to regex for short queries
  let users: any[] = [];
  if (trimmed.length >= 2) {
    try {
      users = await User.find(
        { $text: { $search: trimmed }, onboardingComplete: true },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(limit);
    } catch {
      users = [];
    }
  }

  // Regex fallback for short queries or empty text results
  if (!users || users.length === 0) {
    const regex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    users = await User.find({
      onboardingComplete: true,
      $or: [
        { name: regex },
        { handle: regex },
        { headline: regex },
        { institution: regex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  return Promise.all(users.map(serializeUser));
}

export async function searchPosts(
  query: string,
  cursor?: string,
  limit = SEARCH_LIMIT
): Promise<FeedDTO> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();
  await ensureTextIndexes();

  const trimmed = query.trim();
  if (!trimmed) return { posts: [], nextCursor: null };

  const filter: Record<string, unknown> = { schemaVersion: 2 };
  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  let posts: any[] = [];
  try {
    posts = await Post.find(
      { ...filter, $text: { $search: trimmed } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .limit(limit + 1)
      .populate("author")
      .populate({ path: "repostOf", populate: { path: "author" } });
  } catch {
    posts = [];
  }

  if (posts.length === 0) {
    const regex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    posts = await Post.find({
      ...filter,
      $or: [{ body: regex }, { quoteText: regex }],
    })
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate("author")
      .populate({ path: "repostOf", populate: { path: "author" } });
  }

  const pagePosts = posts.slice(0, limit);
  const postIds = pagePosts.map((p) => p._id);

  // Get viewer reactions
  const reactions = await Reaction.find({
    post: { $in: postIds },
    user: new Types.ObjectId(viewer.id),
  }).select("post type");
  const viewerReactions = new Map<string, ReactionType>();
  for (const r of reactions) viewerReactions.set(r.post.toString(), r.type);

  // Get comments
  const comments = await Comment.find({
    post: { $in: postIds },
    parentComment: null,
  })
    .sort({ createdAt: 1 })
    .populate("author");

  const commentMap = new Map<string, any[]>();
  for (const c of comments) {
    const pid = c.post.toString();
    const list = commentMap.get(pid) || [];
    list.push({
      id: c._id.toString(),
      body: c.body,
      author: await serializeUser(c.author as any),
      depth: c.depth || 0,
      replyCount: c.replyCount || 0,
      replies: [],
      createdAt: c.createdAt.toISOString(),
    });
    commentMap.set(pid, list);
  }

  const serializedPosts: PostDTO[] = [];
  for (const post of pagePosts) {
    const postId = post._id.toString();
    const repostOf = post.repostOf
      ? {
          id: post.repostOf._id.toString(),
          body: post.repostOf.body || "",
          quoteText: post.repostOf.quoteText || "",
          media: (post.repostOf.media || []).map((m: any) =>
            m.toJSON ? m.toJSON() : m
          ),
          author: await serializeUser(post.repostOf.author),
          reactions: {
            fire: post.repostOf.reactions?.fire || 0,
            heart: post.repostOf.reactions?.heart || 0,
            mindblown: post.repostOf.reactions?.mindblown || 0,
            clap: post.repostOf.reactions?.clap || 0,
            laugh: post.repostOf.reactions?.laugh || 0,
            sad: post.repostOf.reactions?.sad || 0,
          },
          totalReactions: post.repostOf.totalReactions || 0,
          commentCount: post.repostOf.commentCount || 0,
          repostCount: post.repostOf.repostCount || 0,
          poll: null,
          createdAt: post.repostOf.createdAt.toISOString(),
        }
      : null;

    serializedPosts.push({
      id: postId,
      body: post.body || "",
      quoteText: post.quoteText || "",
      media: (post.media || []).map((m: any) =>
        m.toJSON ? m.toJSON() : m
      ),
      author: await serializeUser(post.author),
      repostOf,
      reactions: {
        fire: post.reactions?.fire || 0,
        heart: post.reactions?.heart || 0,
        mindblown: post.reactions?.mindblown || 0,
        clap: post.reactions?.clap || 0,
        laugh: post.reactions?.laugh || 0,
        sad: post.reactions?.sad || 0,
      },
      totalReactions: post.totalReactions || 0,
      commentCount: post.commentCount || 0,
      repostCount: post.repostCount || 0,
      viewerReaction: viewerReactions.get(postId) || null,
      canDelete: post.author._id.toString() === viewer.id,
      comments: commentMap.get(postId) || [],
      poll: null,
      createdAt: post.createdAt.toISOString(),
    });
  }

  const nextCursor =
    posts.length > limit
      ? pagePosts[pagePosts.length - 1]?.createdAt.toISOString()
      : null;

  return { posts: serializedPosts, nextCursor };
}

export async function searchByHashtag(
  tag: string,
  cursor?: string,
  limit = SEARCH_LIMIT
): Promise<FeedDTO> {
  const cleanTag = tag.replace(/^#/, "").toLowerCase().trim();
  if (!cleanTag) return { posts: [], nextCursor: null };

  // Reuse searchPosts but with hashtag filter
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const filter: Record<string, unknown> = {
    schemaVersion: 2,
    hashtags: cleanTag,
  };
  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate("author")
    .populate({ path: "repostOf", populate: { path: "author" } });

  const pagePosts = posts.slice(0, limit);
  const postIds = pagePosts.map((p) => p._id);

  const reactions = await Reaction.find({
    post: { $in: postIds },
    user: new Types.ObjectId(viewer.id),
  }).select("post type");
  const viewerReactions = new Map<string, ReactionType>();
  for (const r of reactions) viewerReactions.set(r.post.toString(), r.type);

  const serializedPosts: PostDTO[] = [];
  for (const post of pagePosts) {
    const postId = post._id.toString();
    serializedPosts.push({
      id: postId,
      body: post.body || "",
      quoteText: post.quoteText || "",
      media: (post.media || []).map((m: any) =>
        m.toJSON ? m.toJSON() : m
      ),
      author: await serializeUser(post.author as any),
      repostOf: null,
      reactions: {
        fire: post.reactions?.fire || 0,
        heart: post.reactions?.heart || 0,
        mindblown: post.reactions?.mindblown || 0,
        clap: post.reactions?.clap || 0,
        laugh: post.reactions?.laugh || 0,
        sad: post.reactions?.sad || 0,
      },
      totalReactions: post.totalReactions || 0,
      commentCount: post.commentCount || 0,
      repostCount: post.repostCount || 0,
      viewerReaction: viewerReactions.get(postId) || null,
      canDelete: post.author._id.toString() === viewer.id,
      comments: [],
      poll: null,
      createdAt: post.createdAt.toISOString(),
    });
  }

  const nextCursor =
    posts.length > limit
      ? pagePosts[pagePosts.length - 1]?.createdAt.toISOString()
      : null;

  return { posts: serializedPosts, nextCursor };
}

export async function getTrendingHashtags(
  limit = 10
): Promise<HashtagDTO[]> {
  await connectDB();

  const hashtags = await Hashtag.find({ postCount: { $gt: 0 } })
    .sort({ postCount: -1, lastUsedAt: -1 })
    .limit(limit);

  return hashtags.map((h) => ({
    name: h.name,
    postCount: h.postCount,
  }));
}
