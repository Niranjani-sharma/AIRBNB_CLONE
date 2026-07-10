"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import ListingGrid from "@/components/cards/ListingGrid";
import type { ListingCardDTO, WishlistItemDTO } from "@/lib/types";

export default function WishlistPage() {
  const [items, setItems] = useState<ListingCardDTO[]>([]);
  useEffect(() => {
    api
      .get("/wishlist")
      .then((r) =>
        setItems(
          (r.data as WishlistItemDTO[]).map((w) => w.listing).filter(Boolean)
        )
      )
      .catch((e) => toast.error(e.message));
  }, []);
  return (
    <div className="py-8">
      <h1 className="mb-2 text-2xl font-semibold">Wishlist</h1>
      <ListingGrid listings={items} />
    </div>
  );
}
