export default function MessagesLoading() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 h-8 w-36 rounded bg-muted animate-pulse" />
      <div className="surface-elevated overflow-hidden divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-28 rounded bg-muted" />
              <div className="h-2.5 w-44 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
