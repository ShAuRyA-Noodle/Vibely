export default function NotificationsLoading() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 h-8 w-44 rounded bg-muted animate-pulse" />
      <div className="surface-elevated overflow-hidden divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3.5 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-52 rounded bg-muted" />
              <div className="h-2.5 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
