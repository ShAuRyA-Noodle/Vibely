export default function ConnectionsLoading() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-8 w-40 rounded bg-muted animate-pulse" />
      <div className="mb-5 flex gap-4 border-b border-border pb-3">
        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="surface-elevated flex items-center gap-3 p-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-36 rounded bg-muted" />
              <div className="h-2.5 w-44 rounded bg-muted" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}
