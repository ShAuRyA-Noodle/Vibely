"use client";

import { PostDTO } from "@/lib/actions/posts";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Play,
  Images,
  Grid3x3,
  Sparkles,
} from "lucide-react";

/**
 * Instagram-style 3-column grid for media posts.
 * Shows only posts with at least one image or video.
 * Each tile is square, with hover overlay showing reaction + comment counts.
 */
export default function PostGrid({
  posts,
  emptyMessage = "No posts with media yet.",
}: {
  posts: PostDTO[];
  emptyMessage?: string;
}) {
  const mediaPosts = posts.filter((p) => p.media && p.media.length > 0);

  if (mediaPosts.length === 0) {
    return (
      <div className="surface-elevated flex flex-col items-center justify-center p-16 text-center">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-muted">
          <Grid3x3
            size={20}
            className="text-muted-foreground"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-[14px] font-medium text-foreground">{emptyMessage}</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Posts with images or videos appear here as a grid.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
      {mediaPosts.map((post) => {
        const firstMedia = post.media[0];
        const isVideo = firstMedia.type === "video";
        const hasMultiple = post.media.length > 1;

        return (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="group relative aspect-square overflow-hidden rounded-md bg-muted press"
          >
            {isVideo ? (
              <video
                src={firstMedia.url}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={firstMedia.url}
                alt={post.body.slice(0, 80) || "Post"}
                className="h-full w-full object-cover transition-transform duration-500 ease-apple group-hover:scale-[1.03]"
                loading="lazy"
              />
            )}

            {/* Type indicator (top right) */}
            <div className="absolute top-1.5 right-1.5 text-white drop-shadow-lg">
              {isVideo ? (
                <Play size={15} strokeWidth={2.5} fill="currentColor" />
              ) : hasMultiple ? (
                <Images size={15} strokeWidth={2.5} />
              ) : null}
            </div>

            {/* Hover overlay with stats */}
            <div className="absolute inset-0 flex items-center justify-center gap-5 bg-black/50 opacity-0 transition-opacity duration-200 ease-apple group-hover:opacity-100">
              <span className="inline-flex items-center gap-1.5 text-white font-semibold tabular-nums">
                <Heart
                  size={16}
                  strokeWidth={2.5}
                  fill="currentColor"
                />
                {post.totalReactions}
              </span>
              <span className="inline-flex items-center gap-1.5 text-white font-semibold tabular-nums">
                <MessageCircle
                  size={16}
                  strokeWidth={2.5}
                  fill="currentColor"
                />
                {post.commentCount}
              </span>
            </div>

            {/* Moderation indicator for flagged posts (only visible to author) */}
            {post.canDelete && /* we only expose moderation via canDelete heuristic */ null}
          </Link>
        );
      })}
    </div>
  );
}

// Text-only posts fallback (non-media posts still show in feed view)
export function TextPostsList({ posts }: { posts: PostDTO[] }) {
  const textPosts = posts.filter((p) => !p.media || p.media.length === 0);
  if (textPosts.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={13} className="text-muted-foreground" strokeWidth={2} />
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Text updates
        </h3>
      </div>
      <div className="grid gap-3">
        {textPosts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="surface-elevated block p-4 hover:bg-muted transition-colors press"
          >
            <p className="line-clamp-3 text-[14px] leading-relaxed text-foreground">
              {post.body}
            </p>
            <div className="mt-2 flex items-center gap-3 text-[11.5px] text-muted-foreground tabular-nums">
              <span className="inline-flex items-center gap-1">
                <Heart size={11} strokeWidth={2} />
                {post.totalReactions}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle size={11} strokeWidth={2} />
                {post.commentCount}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Combined view — grid for media posts, list for text posts
export function ProfilePostsView({
  posts,
  emptyMessage,
}: {
  posts: PostDTO[];
  emptyMessage?: string;
}) {
  const hasAnyPosts = posts.length > 0;

  if (!hasAnyPosts) {
    return (
      <div className="surface-elevated flex flex-col items-center justify-center p-16 text-center">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-muted">
          <Grid3x3
            size={20}
            className="text-muted-foreground"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-[14px] font-medium text-foreground">
          {emptyMessage || "No posts yet."}
        </p>
      </div>
    );
  }

  return (
    <>
      <PostGrid posts={posts} emptyMessage="No media posts yet." />
      <TextPostsList posts={posts} />
    </>
  );
}
