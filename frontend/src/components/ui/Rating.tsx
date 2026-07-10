// Rating glyph per the design brief §4: filled black star + number (e.g. ★ 4.97).
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
      {value.toFixed(2)}
      {count != null && <span className="text-muted">· {count} reviews</span>}
    </span>
  );
}
