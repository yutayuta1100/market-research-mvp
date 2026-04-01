export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="panel-surface h-56 animate-pulse bg-white/70" />
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="panel-surface h-[420px] animate-pulse bg-white/70" />
        <div className="space-y-6">
          <div className="panel-surface h-40 animate-pulse bg-white/70" />
          <div className="panel-surface h-56 animate-pulse bg-white/70" />
        </div>
      </div>
    </div>
  );
}

