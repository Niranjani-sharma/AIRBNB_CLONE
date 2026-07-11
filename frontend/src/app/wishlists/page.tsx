"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/lib/toast-context";
import { useWishlist } from "@/lib/wishlist";
import { api } from "@/lib/api";
import ListingGrid from "@/components/cards/ListingGrid";
import EmptyState from "@/components/ui/EmptyState";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";
import type { ListingCard, WishlistItem } from "@/lib/types";

export default function WishlistPage() {
  const toast = useToast();
  const { isSaved, markSaved } = useWishlist();
  const [items, setItems] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/wishlist")
      .then((r) => {
        const listings = (r.data as WishlistItem[]).map((w) => w.listing).filter(Boolean);
        setItems(listings);
        // Prime global saved-state so the shared card hearts show as saved
        // immediately (no first-paint race with the provider's own load).
        markSaved(listings.map((l) => l.id));
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast, markSaved]);

  // Unsaving a card (its heart calls the wishlist context) flips isSaved → the
  // card drops out here immediately; the context handles the DELETE + toast.
  const visible = items.filter((l) => isSaved(l.id));

  return (
    <div className="py-8">
      <h1 className="mb-6 text-[32px] font-bold leading-tight text-ink">Wishlists</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="No saved stays yet"
          body="As you search, click the heart on any stay to save it here."
          ctaLabel="Start exploring"
          ctaHref="/"
        />
      ) : (
        <ListingGrid listings={visible} />
      )}
    </div>
  );
}
