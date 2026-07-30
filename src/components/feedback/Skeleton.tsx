export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="card-skeleton">
      <Skeleton className="skeleton-image" />
      <div className="card-skeleton-body">
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-text" />
        <Skeleton className="skeleton-text short" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-skeleton" role="status" aria-label="Carregando...">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="skeleton-row" />
      ))}
    </div>
  );
}
