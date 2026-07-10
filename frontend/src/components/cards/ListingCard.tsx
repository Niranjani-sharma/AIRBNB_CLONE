"use client";
import Link from "next/link";
import Image from "next/image";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { useWishlist } from "@/lib/wishlist";
import Heart from "@/components/ui/Heart";
import Rating from "@/components/ui/Rating";

export default function ListingCard({ listing }: { listing: ListingCardType }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(listing.id);
  const favourite = listing.ratingAvg != null && listing.ratingAvg >= 4.9;

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(listing.id);
  };

  return (
    <Link href={`/rooms/${listing.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-bg-soft">
        {listing.coverPhoto && (
          <Image
            src={listing.coverPhoto}
            alt={listing.title}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 16vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
        {favourite && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-bg/95 px-2 py-0.5 text-[11px] font-semibold text-ink shadow-sm">
            Guest favourite
          </span>
        )}
        <Heart saved={saved} onClick={toggleSave} className="absolute right-2.5 top-2.5" />
      </div>

      <div className="mt-2">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink">
            {listing.city}, {listing.country}
          </p>
          <Rating value={listing.ratingAvg} className="shrink-0 text-xs" />
        </div>
        <p className="truncate text-sm text-muted">{listing.title}</p>
        <p className="mt-0.5 text-sm text-ink">
          <span className="font-semibold">{formatMoney(listing.pricePerNight)}</span>{" "}
          <span className="text-muted">for 1 night</span>
        </p>
      </div>
    </Link>
  );
}
