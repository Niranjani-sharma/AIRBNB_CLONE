"use client";

// Heart save toggle per the design brief §4: white outline with dark translucent fill
// by default; solid brand when saved.
export default function Heart({
  saved,
  onClick,
  className = "",
}: {
  saved: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={`transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${className}`}
    >
      <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden
        className={saved ? "fill-brand stroke-white" : "fill-black/50 stroke-white"}
        strokeWidth="2">
        <path d="M16 28c7-4.5 12-9.4 12-15a7 7 0 0 0-12.9-3.8L16 10l.9-.8A7 7 0 0 0 4 13c0 5.6 5 10.5 12 15z" />
      </svg>
    </button>
  );
}
