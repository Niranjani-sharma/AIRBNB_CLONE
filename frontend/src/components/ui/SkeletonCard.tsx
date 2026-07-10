export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-card bg-bg-soft" />
      <div className="mt-2 h-4 w-2/3 rounded bg-bg-soft" />
      <div className="mt-2 h-3 w-1/2 rounded bg-bg-soft" />
    </div>
  );
}
