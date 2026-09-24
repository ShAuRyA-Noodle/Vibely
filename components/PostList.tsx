"use client";

import { PostDTO } from "@/lib/actions/posts";
import PostCard from "./PostCard";
import { Sparkles } from "lucide-react";

export default function PostList({
  posts,
  emptyMessage,
}: {
  posts: PostDTO[];
  emptyMessage: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="surface-elevated flex flex-col items-center justify-center p-16 text-center">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-muted">
          <Sparkles size={20} className="text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="text-[14px] font-medium text-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
