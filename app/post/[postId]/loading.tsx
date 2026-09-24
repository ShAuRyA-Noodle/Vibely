import PostSkeleton from "@/components/PostSkeleton";

export default function PostLoading() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-5 h-9 w-24 rounded-lg bg-muted animate-pulse" />
      <PostSkeleton />
    </section>
  );
}
