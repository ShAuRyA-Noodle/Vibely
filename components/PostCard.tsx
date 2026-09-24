"use client";

import {
  createCommentAction,
  deletePostAction,
  EmbeddedPostDTO,
  PostDTO,
  repostPostAction,
  toggleReactionAction,
  CommentDTO,
} from "@/lib/actions/posts";
import { ReactionType } from "@/models/reaction.model";
import {
  ExternalLink,
  Flag,
  MessageCircle,
  MoreHorizontal,
  PlayCircle,
  Repeat2,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import ReactTimeago from "react-timeago";
import { toast } from "sonner";
import ProfilePhoto from "./shared/ProfilePhoto";
import { ReactionPicker } from "./ReactionPicker";
import ReportDialog from "./moderation/ReportDialog";

type MediaItem = PostDTO["media"][number];

const REACTION_EMOJI: Record<ReactionType, string> = {
  fire: "\u{1F525}",
  heart: "\u2764\uFE0F",
  mindblown: "\u{1F92F}",
  clap: "\u{1F44F}",
  laugh: "\u{1F602}",
  sad: "\u{1F622}",
};

function formatDuration(duration?: number) {
  if (!duration) return null;
  const totalSeconds = Math.round(duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function VideoAttachment({ item }: { item: MediaItem }) {
  const [loaded, setLoaded] = useState(false);
  const duration = formatDuration(item.duration);
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-muted">
      {loaded ? (
        <video
          key={item.publicId}
          src={item.url}
          controls
          playsInline
          className="block aspect-video max-h-[560px] w-full bg-black object-contain"
        />
      ) : (
        <div className="flex aspect-video max-h-[560px] min-h-[220px] w-full flex-col items-center justify-center gap-3 px-4 text-center">
          <PlayCircle size={48} className="text-muted-foreground" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-foreground">Video ready</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {duration ? `${duration} MP4` : "MP4"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="btn-primary press"
            >
              Load video
            </button>
            <Link
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary inline-flex items-center gap-1.5 press"
            >
              Open
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageAttachment({ item }: { item: MediaItem }) {
  return (
    <div className="mt-3 flex max-h-[620px] min-h-[160px] w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={item.publicId}
        src={item.url}
        alt="Post media"
        className="block h-auto max-h-[620px] w-auto max-w-full object-contain"
        loading="lazy"
      />
    </div>
  );
}

function Media({ media }: { media: PostDTO["media"] }) {
  if (media.length === 0) return null;
  return (
    <div className="grid gap-3">
      {media.map((item) =>
        item.type === "video" ? (
          <VideoAttachment key={item.publicId} item={item} />
        ) : (
          <ImageAttachment key={item.publicId} item={item} />
        )
      )}
    </div>
  );
}

function AuthorLine({
  post,
}: {
  post: Pick<PostDTO, "author" | "createdAt">;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProfilePhoto src={post.author.avatarUrl} name={post.author.name} />
      <div className="min-w-0">
        <Link
          href={`/profile/${post.author.handle}`}
          className="truncate text-[14.5px] font-semibold text-foreground hover:text-primary transition-colors"
        >
          {post.author.name}
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <p className="truncate">
            {post.author.headline || `@${post.author.handle}`}
          </p>
          <span>·</span>
          <p className="shrink-0 tabular-nums">
            <ReactTimeago date={new Date(post.createdAt)} />
          </p>
        </div>
      </div>
    </div>
  );
}

function EmbeddedPost({ post }: { post: EmbeddedPostDTO }) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted">
      <AuthorLine post={post} />
      {post.body && (
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          {post.body}
        </p>
      )}
      {post.quoteText && (
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          {post.quoteText}
        </p>
      )}
      <Media media={post.media} />
    </div>
  );
}

function ReactionSummary({
  reactions,
  total,
}: {
  reactions: PostDTO["reactions"];
  total: number;
}) {
  if (total === 0) return null;
  const sorted = (Object.entries(reactions) as [ReactionType, number][])
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex -space-x-1">
        {sorted.map(([type]) => (
          <span
            key={type}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-card text-[11px] ring-2 ring-background"
          >
            {REACTION_EMOJI[type]}
          </span>
        ))}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {total}
      </span>
    </span>
  );
}

function CommentThread({
  comment,
  postId,
  onReply,
  isPending,
}: {
  comment: CommentDTO;
  postId: string;
  onReply: (parentId: string, text: string) => void;
  isPending: boolean;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  function handleReplySubmit(e: FormEvent) {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    onReply(comment.id, text);
    setReplyText("");
    setShowReplyInput(false);
  }

  return (
    <div className={comment.depth > 0 ? "ml-6 border-l-2 border-border pl-4" : ""}>
      <div className="flex gap-3">
        <ProfilePhoto
          src={comment.author.avatarUrl}
          name={comment.author.name}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="inline-block rounded-xl rounded-tl-sm bg-muted px-3.5 py-2.5">
            <div className="flex flex-wrap items-baseline gap-2">
              <Link
                href={`/profile/${comment.author.handle}`}
                className="text-[13px] font-semibold text-foreground hover:text-primary transition-colors"
              >
                {comment.author.name}
              </Link>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                <ReactTimeago date={new Date(comment.createdAt)} />
              </span>
            </div>
            <p className="mt-0.5 text-[13.5px] leading-relaxed text-foreground/90">
              {comment.body}
            </p>
          </div>
          {comment.depth < 2 && (
            <div className="mt-1 pl-2">
              <button
                type="button"
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Reply
                {comment.replyCount > 0 && ` (${comment.replyCount})`}
              </button>
            </div>
          )}
          {showReplyInput && (
            <form
              onSubmit={handleReplySubmit}
              className="mt-2 flex gap-2"
            >
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={1000}
                placeholder={`Reply to ${comment.author.name}...`}
                className="input-base flex-1 py-2"
              />
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary press disabled:opacity-60"
              >
                Reply
              </button>
            </form>
          )}
        </div>
      </div>
      {comment.replies.map((reply) => (
        <div key={reply.id} className="mt-3">
          <CommentThread
            comment={reply}
            postId={postId}
            onReply={onReply}
            isPending={isPending}
          />
        </div>
      ))}
    </div>
  );
}

export default function PostCard({ post }: { post: PostDTO }) {
  const router = useRouter();
  const [commentsOpen, setCommentsOpen] = useState(post.comments.length > 0);
  const [comment, setComment] = useState("");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const repostTargetId = post.repostOf?.id || post.id;
  const isPlainRepost =
    Boolean(post.repostOf) &&
    !post.quoteText &&
    !post.body &&
    post.media.length === 0;

  function runAction(action: () => Promise<void>, success: string) {
    startTransition(async () => {
      try {
        await action();
        router.refresh();
        toast.success(success);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Action failed.");
      }
    });
  }

  function handleReaction(reactionType: ReactionType) {
    runAction(
      () => toggleReactionAction(post.id, reactionType),
      "Reaction updated."
    );
  }

  function onCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = comment.trim();
    if (!text) return;
    runAction(async () => {
      await createCommentAction(post.id, text);
      setComment("");
      setCommentsOpen(true);
    }, "Comment added.");
  }

  function onReply(parentId: string, text: string) {
    runAction(async () => {
      await createCommentAction(post.id, text, parentId);
      setCommentsOpen(true);
    }, "Reply added.");
  }

  function onQuoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = quoteText.trim();
    if (!text) {
      toast.error("Add a note for your quote repost.");
      return;
    }
    runAction(async () => {
      await repostPostAction(repostTargetId, text);
      setQuoteText("");
      setQuoteOpen(false);
    }, "Quote reposted.");
  }

  const content = post.repostOf ? (
    <>
      {post.quoteText && (
        <p className="mt-3 whitespace-pre-wrap text-[14.5px] leading-relaxed text-foreground">
          {post.quoteText}
        </p>
      )}
      {!isPlainRepost && post.body && (
        <p className="mt-3 whitespace-pre-wrap text-[14.5px] leading-relaxed text-foreground">
          {post.body}
        </p>
      )}
      <EmbeddedPost post={post.repostOf} />
    </>
  ) : (
    <>
      {post.body && (
        <p className="mt-3 whitespace-pre-wrap text-[14.5px] leading-relaxed text-foreground">
          {post.body}
        </p>
      )}
      <Media media={post.media} />
    </>
  );

  return (
    <article className="group surface-elevated">
      <div className="p-5">
        {isPlainRepost && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Repeat2 size={13} className="text-primary" strokeWidth={2} />
            <span className="font-medium">{post.author.name} reposted</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          {!isPlainRepost && <AuthorLine post={post} />}
          {isPlainRepost && post.repostOf && (
            <AuthorLine post={post.repostOf} />
          )}

          {/* Post menu: delete (owner) + report (others) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors press"
              aria-label="Post menu"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-border bg-popover shadow-lg overflow-hidden animate-fade-up">
                {post.canDelete ? (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setMenuOpen(false);
                      runAction(
                        () => deletePostAction(post.id),
                        "Post deleted."
                      );
                    }}
                    disabled={isPending}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                  >
                    <Trash2 size={13} />
                    Delete post
                  </button>
                ) : (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setMenuOpen(false);
                      setReportOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <Flag size={13} />
                    Report post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <ReportDialog
          postId={post.id}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />

        {content}

        {/* Stats */}
        {(post.totalReactions > 0 ||
          post.commentCount > 0 ||
          post.repostCount > 0) && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
            <ReactionSummary
              reactions={post.reactions}
              total={post.totalReactions}
            />
            <div className="flex gap-3 tabular-nums">
              {post.commentCount > 0 && (
                <button
                  type="button"
                  onClick={() => setCommentsOpen((o) => !o)}
                  className="hover:text-foreground transition-colors"
                >
                  {post.commentCount} comment{post.commentCount > 1 ? "s" : ""}
                </button>
              )}
              {post.repostCount > 0 && (
                <span>
                  {post.repostCount} repost{post.repostCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-1 grid grid-cols-4 gap-1 border-t border-border pt-2">
          <ReactionPicker
            currentReaction={post.viewerReaction}
            onReact={handleReaction}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setCommentsOpen((o) => !o)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground press transition-colors"
          >
            <MessageCircle size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Comment</span>
          </button>
          <button
            type="button"
            onClick={() =>
              runAction(
                () => repostPostAction(repostTargetId),
                "Repost updated."
              )
            }
            disabled={isPending}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground press transition-colors"
          >
            <Repeat2 size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Repost</span>
          </button>
          <button
            type="button"
            onClick={() => setQuoteOpen((o) => !o)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground press transition-colors"
          >
            <Send size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Quote</span>
          </button>
        </div>

        {quoteOpen && (
          <form
            className="mt-3 flex gap-2 border-t border-border pt-3"
            onSubmit={onQuoteSubmit}
          >
            <input
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              maxLength={1000}
              placeholder="Add your take..."
              className="input-base flex-1"
            />
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary press disabled:opacity-60"
            >
              Quote
            </button>
          </form>
        )}

        {commentsOpen && (
          <div className="mt-3 border-t border-border pt-3">
            <form onSubmit={onCommentSubmit} className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                placeholder="Add a comment..."
                className="input-base flex-1"
              />
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary press disabled:opacity-60"
              >
                Send
              </button>
            </form>
            <div className="mt-4 grid gap-4">
              {post.comments.map((item) => (
                <CommentThread
                  key={item.id}
                  comment={item}
                  postId={post.id}
                  onReply={onReply}
                  isPending={isPending}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
