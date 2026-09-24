import PostSkeleton from "@/components/PostSkeleton";

export default function FeedLoading() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-5 px-4 py-8 md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
      <div className="hidden md:block">
        <div className="h-[340px] surface-elevated animate-pulse" />
      </div>
      <div className="min-w-0 space-y-4">
        <div className="h-[76px] w-full surface-elevated animate-pulse" />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
      <div className="hidden xl:block">
        <div className="h-[400px] surface-elevated animate-pulse" />
      </div>
    </div>
  );
}
