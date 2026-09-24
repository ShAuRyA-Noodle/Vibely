export default function PostSkeleton() {
  return (
    <div className="surface-elevated p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-24 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full rounded bg-muted animate-pulse" />
        <div className="h-3.5 w-[90%] rounded bg-muted animate-pulse" />
        <div className="h-3.5 w-[60%] rounded bg-muted animate-pulse" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-1 border-t border-border pt-3">
        <div className="h-8 rounded-lg bg-muted animate-pulse" />
        <div className="h-8 rounded-lg bg-muted animate-pulse" />
        <div className="h-8 rounded-lg bg-muted animate-pulse" />
        <div className="h-8 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  );
}
