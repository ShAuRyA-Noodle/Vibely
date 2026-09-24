export default function SearchLoading() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-12 w-full rounded-lg bg-muted animate-pulse" />
      <div className="grid gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="surface-elevated flex items-center gap-3 p-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 rounded bg-muted" />
              <div className="h-2.5 w-48 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
