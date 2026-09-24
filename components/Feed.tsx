"use client";

import { FeedDTO } from "@/lib/actions/posts";
import { UserDTO } from "@/lib/actions/users";
import { useEffect, useState } from "react";
import PostComposer from "./PostComposer";
import PostList from "./PostList";
import { Loader2 } from "lucide-react";

export default function Feed({
  user,
  initialFeed,
}: {
  user: UserDTO;
  initialFeed: FeedDTO;
}) {
  const [posts, setPosts] = useState(initialFeed.posts);
  const [nextCursor, setNextCursor] = useState(initialFeed.nextCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPosts(initialFeed.posts);
    setNextCursor(initialFeed.nextCursor);
  }, [initialFeed]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await fetch(
        `/api/feed?cursor=${encodeURIComponent(nextCursor)}`
      );
      const data = (await response.json()) as FeedDTO;
      setPosts((current) => [...current, ...data.posts]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Failed to load more posts");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className="min-w-0 pb-20 md:pb-0">
      <div className="mb-4">
        <PostComposer user={user} />
      </div>

      <PostList
        posts={posts}
        emptyMessage="No posts yet. Write something to get the vibe going."
      />

      {nextCursor && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-6 w-full surface-interactive py-3 text-sm font-medium text-foreground press disabled:opacity-60"
        >
          {loadingMore ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 size={15} className="animate-spin" />
              Loading…
            </span>
          ) : (
            "Load more"
          )}
        </button>
      )}
    </section>
  );
}
