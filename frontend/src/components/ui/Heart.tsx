"use client";
import { Heart as HeartIcon } from "lucide-react";

// Wishlist heart (Airbnb style): white outline with a translucent dark fill by
// default (so it reads on any photo), solid brand #FF385C when saved.
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
      <HeartIcon
        size={24}
        strokeWidth={2}
        className={`drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] ${
          saved ? "fill-brand text-white" : "fill-black/50 text-white"
        }`}
        aria-hidden
      />
    </button>
  );
}
