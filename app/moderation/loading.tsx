export default function ModerationLoading() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-72 rounded bg-muted animate-pulse" />
          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="grid gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="surface-elevated p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-3 w-64 rounded bg-muted" />
                <div className="h-20 w-full rounded-lg bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
