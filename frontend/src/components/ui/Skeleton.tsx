// Loading placeholder. Respects prefers-reduced-motion (no pulse when reduced).
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-soft motion-reduce:animate-none ${className}`} />;
}

export function ListingCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-2 h-3 w-1/3" />
    </div>
  );
}
