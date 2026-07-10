"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";
import ListingGrid from "@/components/cards/ListingGrid";
import EmptyState from "@/components/ui/EmptyState";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";
import type { ListingCard, WishlistItem } from "@/lib/types";

export default function WishlistPage() {
  const toast = useToast();
  const [items, setItems] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/wishlist")
      .then((r) => setItems((r.data as WishlistItem[]).map((w) => w.listing).filter(Boolean)))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="py-8">
      <h1 className="mb-2 text-2xl font-semibold">Wishlists</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 py-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="No saves yet"
          body="As you search, tap the heart on any stay to save it here for later."
          ctaLabel="Explore stays"
          ctaHref="/"
        />
      ) : (
        <ListingGrid listings={items} />
      )}
    </div>
  );
}
