export default function ProfileLoading() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="surface-elevated overflow-hidden animate-pulse">
        <div className="h-40 bg-muted" />
        <div className="px-6 pb-6">
          <div className="-mt-14 flex items-end justify-between">
            <div className="h-24 w-24 rounded-full bg-muted ring-4 ring-card" />
            <div className="h-9 w-28 rounded-lg bg-muted" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-7 w-48 rounded bg-muted" />
            <div className="h-3.5 w-36 rounded bg-muted" />
          </div>
          <div className="mt-6 flex gap-6">
            <div className="h-5 w-24 rounded bg-muted" />
            <div className="h-5 w-24 rounded bg-muted" />
            <div className="h-5 w-20 rounded bg-muted" />
          </div>
        </div>
      </div>
    </section>
  );
}
