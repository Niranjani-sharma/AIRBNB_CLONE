import { formatRating } from "@/lib/rating";

// Rating glyph: filled star + number (e.g. ★ 4.97, ★ 5.0).
export default function Rating({
  value,
  count,
  className = "",
}: {
  value: number | null;
  count?: number;
  className?: string;
}) {
  if (value == null) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-ink ${className}`}>
      <span aria-hidden>★</span>
      {formatRating(value)}
      {count != null && <span className="text-muted">· {count} reviews</span>}
    </span>
  );
}
