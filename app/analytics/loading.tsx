export default function AnalyticsLoading() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 h-8 w-36 rounded bg-muted animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="surface-elevated p-5 flex items-start gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="h-6 w-16 rounded bg-muted" />
              <div className="h-2.5 w-28 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
