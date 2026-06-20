"use server";

import connectDB from "@/lib/db";
import { Comment } from "@/models/comment.model";
import { Post, IPostMedia, IPostDocument, IReactionCounts } from "@/models/post.model";
import { Reaction, ReactionType, REACTION_TYPES } from "@/models/reaction.model";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { requireOnboardedUserProfile, serializeUser, UserDTO } from "./users";
import { extractHashtags, extractMentions } from "@/lib/hashtags";
import { Hashtag } from "@/models/hashtag.model";
import { createNotification } from "./notifications";
import { User } from "@/models/user.model";
import { checkContent } from "@/lib/moderation/proofguard";
import { getPostingEligibility, issueStrike } from "./moderation";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export type MediaInput = IPostMedia;

export type CommentDTO = {
  id: string;
  body: string;
  author: UserDTO;
  depth: number;
  replyCount: number;
  replies: CommentDTO[];
  createdAt: string;
};

export type ReactionCountsDTO = {
  fire: number;
  heart: number;
  mindblown: number;
  clap: number;
  laugh: number;
  sad: number;
};

export type PollOptionDTO = {
  text: string;
  voteCount: number;
};

export type PollDTO = {
  options: PollOptionDTO[];
  totalVotes: number;
  expiresAt: string | null;
  viewerVote: number | null; // optionIndex or null
};

export type PostDTO = {
  id: string;
  body: string;
  quoteText: string;
  media: IPostMedia[];
  author: UserDTO;
  repostOf: EmbeddedPostDTO | null;
  reactions: ReactionCountsDTO;
  totalReactions: number;
  commentCount: number;
  repostCount: number;
  viewerReaction: ReactionType | null;
  canDelete: boolean;
  comments: CommentDTO[];
  poll: PollDTO | null;
  createdAt: string;
};

export type EmbeddedPostDTO = Omit<
  PostDTO,
  "repostOf" | "viewerReaction" | "canDelete" | "comments" | "poll"
> & { poll: PollDTO | null };

export type FeedDTO = {
  posts: PostDTO[];
  nextCursor: string | null;
};

const FEED_LIMIT = 12;
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const DEFAULT_REACTIONS: ReactionCountsDTO = {
  fire: 0,
  heart: 0,
  mindblown: 0,
  clap: 0,
  laugh: 0,
  sad: 0,
};

function isPlainObjectId(value: string) {
  return Types.ObjectId.isValid(value);
}

function cleanBody(value: string, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function validateMedia(media: MediaInput[]) {
  if (!Array.isArray(media)) {
    throw new Error("Invalid media.");
  }

  if (media.length > MAX_IMAGES) {
    throw new Error("A post can contain up to 4 images or 1 video.");
  }

  const videoCount = media.filter((item) => item.type === "video").length;
  if (videoCount > 1 || (videoCount === 1 && media.length > 1)) {
    throw new Error("A post can contain 1 video or up to 4 images.");
  }

  media.forEach((item) => {
    if (!item.url || !item.publicId) {
      throw new Error("Invalid media upload.");
    }

    if (item.type !== "image" && item.type !== "video") {
      throw new Error("Unsupported media type.");
    }

    if (item.resourceType !== item.type) {
      throw new Error("Media resource type does not match.");
    }

    if (item.type === "image" && (item.bytes || 0) > MAX_IMAGE_BYTES) {
      throw new Error("Images must be 8MB or smaller.");
    }

    if (item.type === "video" && (item.bytes || 0) > MAX_VIDEO_BYTES) {
      throw new Error("Videos must be 50MB or smaller.");
    }
  });
}

async function destroyMedia(media: MediaInput[]) {
  await Promise.allSettled(
    media.map((item) =>
      cloudinary.uploader.destroy(item.publicId, {
        resource_type: item.resourceType,
      })
    )
  );
}

function serializeMedia(media: any[]): IPostMedia[] {
  return (media || []).map((m) => (m.toJSON ? m.toJSON() : m));
}

function serializeReactions(reactions: any): ReactionCountsDTO {
  if (!reactions) return { ...DEFAULT_REACTIONS };
  const obj = reactions.toJSON ? reactions.toJSON() : reactions;
  return {
    fire: obj.fire || 0,
    heart: obj.heart || 0,
    mindblown: obj.mindblown || 0,
    clap: obj.clap || 0,
    laugh: obj.laugh || 0,
    sad: obj.sad || 0,
  };
}

function serializePoll(post: any, viewerId: string): PollDTO | null {
  if (!post.poll || !post.poll.options || post.poll.options.length === 0)
    return null;

  const voter = (post.poll.voters || []).find(
    (v: any) => v.user?.toString() === viewerId
  );

  return {
    options: (post.poll.options || []).map((o: any) => ({
      text: o.text,
      voteCount: o.voteCount || 0,
    })),
    totalVotes: post.poll.totalVotes || 0,
    expiresAt: post.poll.expiresAt
      ? post.poll.expiresAt.toISOString()
      : null,
    viewerVote: voter ? voter.optionIndex : null,
  };
}

async function serializeEmbeddedPost(post: any): Promise<EmbeddedPostDTO> {
  return {
    id: post._id.toString(),
    body: post.body || "",
    quoteText: post.quoteText || "",
    media: serializeMedia(post.media),
    author: await serializeUser(post.author),
    reactions: serializeReactions(post.reactions),
    totalReactions: post.totalReactions || 0,
    commentCount: post.commentCount || 0,
    repostCount: post.repostCount || 0,
    poll: null,
    createdAt: post.createdAt.toISOString(),
  };
}

async function serializePost(
  post: any,
  viewerId: string,
  viewerReactions: Map<string, ReactionType>,
  commentsByPostId: Map<string, CommentDTO[]>
): Promise<PostDTO> {
  const postId = post._id.toString();
  const repostOf = post.repostOf
    ? await serializeEmbeddedPost(post.repostOf)
    : null;

  return {
    id: postId,
    body: post.body || "",
    quoteText: post.quoteText || "",
    media: serializeMedia(post.media),
    author: await serializeUser(post.author),
    repostOf,
    reactions: serializeReactions(post.reactions),
    totalReactions: post.totalReactions || 0,
    commentCount: post.commentCount || 0,
    repostCount: post.repostCount || 0,
    viewerReaction: viewerReactions.get(postId) || null,
    canDelete: post.author._id.toString() === viewerId,
    comments: commentsByPostId.get(postId) || [],
    poll: serializePoll(post, viewerId),
    createdAt: post.createdAt.toISOString(),
  };
}

async function getCommentsByPostId(postIds: Types.ObjectId[]) {
  // Fetch top-level comments
  const topLevel = await Comment.find({
    post: { $in: postIds },
    parentComment: null,
  })
    .sort({ createdAt: 1 })
    .populate("author");

  // Fetch replies (depth 1-2)
  const topLevelIds = topLevel.map((c) => c._id);
  const replies = await Comment.find({
    parentComment: { $in: topLevelIds },
  })
    .sort({ createdAt: 1 })
    .limit(100) // cap total replies loaded
    .populate("author");

  // Build reply map
  const replyMap = new Map<string, CommentDTO[]>();
  for (const reply of replies) {
    const parentId = reply.parentComment!.toString();
    const list = replyMap.get(parentId) || [];
    list.push({
      id: reply._id.toString(),
      body: reply.body,
      author: await serializeUser(reply.author as any),
      depth: reply.depth,
      replyCount: reply.replyCount,
      replies: [], // don't go deeper than 2 levels in initial load
      createdAt: reply.createdAt.toISOString(),
    });
    replyMap.set(parentId, list);
  }

  // Build post comment map with nested replies
  const map = new Map<string, CommentDTO[]>();
  for (const comment of topLevel) {
    const postId = comment.post.toString();
    const commentId = comment._id.toString();
    const list = map.get(postId) || [];
    list.push({
      id: commentId,
      body: comment.body,
      author: await serializeUser(comment.author as any),
      depth: comment.depth,
      replyCount: comment.replyCount,
      replies: replyMap.get(commentId) || [],
      createdAt: comment.createdAt.toISOString(),
    });
    map.set(postId, list);
  }

  return map;
}

async function getViewerReactions(
  postIds: Types.ObjectId[],
  viewerId: string
) {
  const reactions = await Reaction.find({
    post: { $in: postIds },
    user: new Types.ObjectId(viewerId),
  }).select("post type");

  const map = new Map<string, ReactionType>();
  for (const r of reactions) {
    map.set(r.post.toString(), r.type);
  }
  return map;
}

// ── Post CRUD ──────────────────────────────────────────────

export type PollInput = {
  options: string[];
  durationDays?: number;
};

export async function createPostAction(input: {
  body: string;
  media: MediaInput[];
  poll?: PollInput;
}) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const body = cleanBody(input.body, 3000);
  const media = input.media || [];

  try {
    validateMedia(media);
  } catch (error) {
    await destroyMedia(media);
    throw error;
  }

  // Build poll if provided
  let pollData: any;
  if (input.poll && input.poll.options.length >= 2) {
    const pollOptions = input.poll.options
      .map((o) => o.trim().slice(0, 100))
      .filter(Boolean)
      .slice(0, 4);
    if (pollOptions.length >= 2) {
      pollData = {
        options: pollOptions.map((text) => ({ text, voteCount: 0 })),
        totalVotes: 0,
        expiresAt: input.poll.durationDays
          ? new Date(
              Date.now() + input.poll.durationDays * 24 * 60 * 60 * 1000
            )
          : undefined,
        voters: [],
      };
    }
  }

  if (!body && media.length === 0 && !pollData) {
    throw new Error("Add text, an image, a video, or a poll before posting.");
  }

  // Gate: is user allowed to post? (ban / restriction check)
  const eligibility = await getPostingEligibility();
  if (!eligibility.canPost) {
    await destroyMedia(media);
    throw new Error(eligibility.reason || "You cannot post right now.");
  }

  // ProofGuard safety check
  const moderation = await checkContent({
    text: body,
    media: media.map((m) => ({
      type: m.type,
      url: m.url,
      publicId: m.publicId,
    })),
  });

  if (moderation.decision === "block") {
    await destroyMedia(media);
    // Issue auto-warning strike for severe violations (repeat => ban)
    const severe = moderation.violations.some((v) => v.severity === 3);
    if (severe) {
      await issueStrike(viewer.id, "minor", "auto_moderation", {
        reason: `ProofGuard auto-block: ${moderation.categories.join(", ")}.`,
        categories: moderation.categories,
      });
    }
    throw new Error(
      `Post blocked by ProofGuard — ${moderation.summary} If you believe this is an error, contact support.`
    );
  }

  const hashtags = extractHashtags(body);
  const mentions = extractMentions(body);

  try {
    await Post.create({
      author: new Types.ObjectId(viewer.id),
      body,
      media,
      reactions: { ...DEFAULT_REACTIONS },
      totalReactions: 0,
      commentCount: 0,
      repostCount: 0,
      hashtags,
      mentions,
      ...(pollData ? { poll: pollData } : {}),
      moderation: {
        decision: moderation.decision,
        score: moderation.score,
        categories: moderation.categories,
        checkedAt: new Date(moderation.checkedAt),
        stages: moderation.stageResults,
      },
      isHidden: false,
      reportCount: 0,
      schemaVersion: 2,
    });
  } catch (error) {
    await destroyMedia(media);
    throw error;
  }

  // Upsert hashtag counts
  if (hashtags.length > 0) {
    await Promise.all(
      hashtags.map((tag) =>
        Hashtag.updateOne(
          { name: tag },
          { $inc: { postCount: 1 }, $set: { lastUsedAt: new Date() } },
          { upsert: true }
        )
      )
    );
  }

  // Mention notifications
  if (mentions.length > 0) {
    const mentionedUsers = await User.find({
      handle: { $in: mentions },
      onboardingComplete: true,
    }).select("_id");
    const createdPost = await Post.findOne({
      author: new Types.ObjectId(viewer.id),
      schemaVersion: 2,
    }).sort({ createdAt: -1 });
    if (createdPost) {
      for (const mu of mentionedUsers) {
        await createNotification({
          recipientId: mu._id.toString(),
          actorId: viewer.id,
          type: "mention",
          postId: createdPost._id.toString(),
        });
      }
    }
  }

  revalidatePath("/feed");
  revalidatePath(`/profile/${viewer.handle}`);
}

// ── Comments ───────────────────────────────────────────────

export async function createCommentAction(
  postId: string,
  body: string,
  parentCommentId?: string
) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!isPlainObjectId(postId)) {
    throw new Error("Invalid post.");
  }

  const text = cleanBody(body, 1000);
  if (!text) {
    throw new Error("Comment cannot be empty.");
  }

  const post = await Post.findOne({ _id: postId, schemaVersion: 2 });
  if (!post) {
    throw new Error("Post not found.");
  }

  let depth = 0;
  if (parentCommentId) {
    if (!isPlainObjectId(parentCommentId)) {
      throw new Error("Invalid parent comment.");
    }
    const parent = await Comment.findById(parentCommentId);
    if (!parent || parent.post.toString() !== postId) {
      throw new Error("Parent comment not found.");
    }
    depth = Math.min(parent.depth + 1, 2);
  }

  const newComment = await Comment.create({
    post: post._id,
    author: new Types.ObjectId(viewer.id),
    body: text,
    parentComment: parentCommentId
      ? new Types.ObjectId(parentCommentId)
      : undefined,
    depth,
    replyCount: 0,
  });

  // Increment counts
  const updates: Promise<any>[] = [
    Post.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } }),
  ];
  if (parentCommentId) {
    updates.push(
      Comment.updateOne(
        { _id: parentCommentId },
        { $inc: { replyCount: 1 } }
      )
    );
    // Reply notification to parent comment author
    const parentComment = await Comment.findById(parentCommentId);
    if (parentComment) {
      await createNotification({
        recipientId: parentComment.author.toString(),
        actorId: viewer.id,
        type: "reply",
        postId: post._id.toString(),
        commentId: newComment._id.toString(),
      });
    }
  } else {
    // Comment notification to post author
    await createNotification({
      recipientId: post.author.toString(),
      actorId: viewer.id,
      type: "comment",
      postId: post._id.toString(),
      commentId: newComment._id.toString(),
    });
  }
  await Promise.all(updates);

  revalidatePath("/feed");
}

// ── Reactions ──────────────────────────────────────────────

export async function toggleReactionAction(
  postId: string,
  reactionType: ReactionType
) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!isPlainObjectId(postId)) {
    throw new Error("Invalid post.");
  }
  if (!REACTION_TYPES.includes(reactionType)) {
    throw new Error("Invalid reaction type.");
  }

  const post = await Post.findOne({ _id: postId, schemaVersion: 2 });
  if (!post) {
    throw new Error("Post not found.");
  }

  const query = {
    post: post._id,
    user: new Types.ObjectId(viewer.id),
  };
  const existing = await Reaction.findOne(query);

  if (existing) {
    if (existing.type === reactionType) {
      // Same reaction → remove
      await existing.deleteOne();
      await Post.updateOne(
        { _id: post._id },
        {
          $inc: {
            [`reactions.${reactionType}`]: -1,
            totalReactions: -1,
          },
        }
      );
    } else {
      // Different reaction → swap
      const oldType = existing.type;
      existing.type = reactionType;
      await existing.save();
      await Post.updateOne(
        { _id: post._id },
        {
          $inc: {
            [`reactions.${oldType}`]: -1,
            [`reactions.${reactionType}`]: 1,
          },
        }
      );
    }
  } else {
    // New reaction
    await Reaction.create({ ...query, type: reactionType });
    await Post.updateOne(
      { _id: post._id },
      {
        $inc: {
          [`reactions.${reactionType}`]: 1,
          totalReactions: 1,
        },
      }
    );
    // Notify post author
    await createNotification({
      recipientId: post.author.toString(),
      actorId: viewer.id,
      type: "reaction",
      postId: post._id.toString(),
    });
  }

  revalidatePath("/feed");
}

// ── Polls ──────────────────────────────────────────────────

export async function votePollAction(
  postId: string,
  optionIndex: number
) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!isPlainObjectId(postId)) throw new Error("Invalid post.");

  const post = await Post.findOne({ _id: postId, schemaVersion: 2 });
  if (!post) throw new Error("Post not found.");
  if (!post.poll) throw new Error("This post has no poll.");

  if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
    throw new Error("Invalid poll option.");
  }

  // Check expiry
  if (post.poll.expiresAt && new Date() > post.poll.expiresAt) {
    throw new Error("This poll has expired.");
  }

  // Check if already voted
  const existingVote = post.poll.voters.find(
    (v) => v.user.toString() === viewer.id
  );
  if (existingVote) {
    throw new Error("You have already voted.");
  }

  // Add vote
  post.poll.voters.push({
    user: new Types.ObjectId(viewer.id),
    optionIndex,
  });
  post.poll.options[optionIndex].voteCount += 1;
  post.poll.totalVotes += 1;
  await post.save();

  revalidatePath("/feed");
}

// ── Reposts ────────────────────────────────────────────────

export async function repostPostAction(postId: string, quoteText = "") {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!isPlainObjectId(postId)) {
    throw new Error("Invalid post.");
  }

  const originalPost = await Post.findOne({ _id: postId, schemaVersion: 2 });
  if (!originalPost) {
    throw new Error("Post not found.");
  }

  const author = new Types.ObjectId(viewer.id);
  const quote = cleanBody(quoteText, 1000);

  if (!quote) {
    const existingRepost = await Post.findOne({
      author,
      repostOf: originalPost._id,
      body: "",
      quoteText: "",
      media: { $size: 0 },
      schemaVersion: 2,
    });

    if (existingRepost) {
      await existingRepost.deleteOne();
      await Post.updateOne(
        { _id: originalPost._id },
        { $inc: { repostCount: -1 } }
      );
    } else {
      await Post.create({
        author,
        body: "",
        media: [],
        repostOf: originalPost._id,
        quoteText: "",
        reactions: { ...DEFAULT_REACTIONS },
        totalReactions: 0,
        commentCount: 0,
        repostCount: 0,
        schemaVersion: 2,
      });
      await Post.updateOne(
        { _id: originalPost._id },
        { $inc: { repostCount: 1 } }
      );
    }
  } else {
    await Post.create({
      author,
      body: "",
      media: [],
      repostOf: originalPost._id,
      quoteText: quote,
      reactions: { ...DEFAULT_REACTIONS },
      totalReactions: 0,
      commentCount: 0,
      repostCount: 0,
      schemaVersion: 2,
    });
    await Post.updateOne(
      { _id: originalPost._id },
      { $inc: { repostCount: 1 } }
    );
  }

  revalidatePath("/feed");
  revalidatePath(`/profile/${viewer.handle}`);
}

// ── Delete ─────────────────────────────────────────────────

export async function deletePostAction(postId: string) {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!isPlainObjectId(postId)) {
    throw new Error("Invalid post.");
  }

  const post = await Post.findOne({ _id: postId, schemaVersion: 2 });
  if (!post) {
    throw new Error("Post not found.");
  }

  if (post.author.toString() !== viewer.id) {
    throw new Error("Only the author can delete this post.");
  }

  if (post.repostOf) {
    await Post.updateOne(
      { _id: post.repostOf },
      { $inc: { repostCount: -1 } }
    );
  }

  const reposts = await Post.find({
    repostOf: post._id,
    schemaVersion: 2,
  }).select("_id");
  const targetPostIds = [post._id, ...reposts.map((r) => r._id)];

  await destroyMedia(post.media || []);
  await Promise.all([
    Comment.deleteMany({ post: { $in: targetPostIds } }),
    Reaction.deleteMany({ post: { $in: targetPostIds } }),
    Post.deleteMany({ _id: { $in: targetPostIds } }),
  ]);

  revalidatePath("/feed");
  revalidatePath(`/profile/${viewer.handle}`);
}

// ── Feed queries ───────────────────────────────────────────

export async function getFeedPosts(
  cursor?: string,
  limit = FEED_LIMIT
): Promise<FeedDTO> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const filter: Record<string, unknown> = {
    schemaVersion: 2,
    $or: [{ isHidden: { $exists: false } }, { isHidden: false }],
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
  const postIds = pagePosts.map((post) => post._id);

  const [viewerReactions, commentsByPostId] = await Promise.all([
    getViewerReactions(postIds, viewer.id),
    getCommentsByPostId(postIds),
  ]);

  const serializedPosts = await Promise.all(
    pagePosts.map((post) =>
      serializePost(post, viewer.id, viewerReactions, commentsByPostId)
    )
  );

  const nextCursor =
    posts.length > limit
      ? pagePosts[pagePosts.length - 1]?.createdAt.toISOString()
      : null;

  return {
    posts: serializedPosts,
    nextCursor,
  };
}

export async function getPostById(postId: string): Promise<PostDTO | null> {
  if (!Types.ObjectId.isValid(postId)) return null;
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const post = await Post.findOne({
    _id: postId,
    schemaVersion: 2,
    $or: [{ isHidden: { $exists: false } }, { isHidden: false }],
  })
    .populate("author")
    .populate({ path: "repostOf", populate: { path: "author" } });

  if (!post) return null;

  const [viewerReactions, commentsByPostId] = await Promise.all([
    getViewerReactions([post._id], viewer.id),
    getCommentsByPostId([post._id]),
  ]);

  return serializePost(post, viewer.id, viewerReactions, commentsByPostId);
}

export async function getProfilePosts(userId: string): Promise<PostDTO[]> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  const posts = await Post.find({
    author: new Types.ObjectId(userId),
    schemaVersion: 2,
    $or: [{ isHidden: { $exists: false } }, { isHidden: false }],
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("author")
    .populate({ path: "repostOf", populate: { path: "author" } });

  const postIds = posts.map((post: IPostDocument) => post._id);
  const [viewerReactions, commentsByPostId] = await Promise.all([
    getViewerReactions(postIds, viewer.id),
    getCommentsByPostId(postIds),
  ]);

  return Promise.all(
    posts.map((post) =>
      serializePost(post, viewer.id, viewerReactions, commentsByPostId)
    )
  );
}
