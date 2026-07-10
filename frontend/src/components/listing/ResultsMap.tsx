"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { formatMoney } from "@/lib/money";
import type { ListingCard } from "@/lib/types";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-bg-soft motion-reduce:animate-none" />
  ),
});

// Interactive results map with a price pin per listing (Airbnb bonus). Only
// listings with coordinates are plotted; clicking a pin opens the listing.
export default function ResultsMap({ listings }: { listings: ListingCard[] }) {
  const [open, setOpen] = useState(false);
  const points = listings
    .filter((l) => l.latitude != null && l.longitude != null)
    .map((l) => ({
      id: l.id,
      lat: l.latitude as number,
      lng: l.longitude as number,
      label: formatMoney(l.pricePerNight),
      title: l.title,
      href: `/rooms/${l.id}`,
    }));

  if (points.length === 0) return null;

  return (
    <div className="my-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-bg-soft"
      >
        <span aria-hidden>🗺️</span>
        {open ? "Hide map" : "Show map"}
        <span className="text-muted">· {points.length} stays</span>
      </button>
      {open && (
        <div className="mt-3 h-[460px] w-full overflow-hidden rounded-2xl border border-line">
          <InteractiveMap points={points} zoom={4} />
        </div>
      )}
    </div>
  );
}
