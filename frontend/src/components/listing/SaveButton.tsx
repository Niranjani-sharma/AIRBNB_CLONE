"use client";
import { useWishlist } from "@/lib/wishlist";

export default function SaveButton({ listingId }: { listingId: number }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(listingId);
  return (
    <button
      onClick={() => toggle(listingId)}
      aria-pressed={saved}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink underline hover:bg-bg-soft"
    >
      <span aria-hidden>{saved ? "❤️" : "🤍"}</span> Save
    </button>
  );
}
