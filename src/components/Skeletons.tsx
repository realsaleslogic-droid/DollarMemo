'use client';

export function CardSkeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton h-32 ${className}`} />;
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="card p-5">
      <div className="skeleton mb-4 h-5 w-40" />
      <div className="skeleton" style={{ height }} />
    </div>
  );
}

export function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="skeleton h-11 w-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-1/3" />
            <div className="skeleton h-3 w-1/4" />
          </div>
          <div className="skeleton h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
