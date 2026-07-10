"use client";
import { useRef } from "react";
import ListingCard from "@/components/cards/ListingCard";
import type { ListingCardDTO } from "@/lib/types";

// A titled, horizontally-scrollable row of listing cards with prev/next arrows —
// the "Popular homes in …" pattern from Airbnb's landing page.
export default function HomeCarousel({
  title,
  listings,
}: {
  title: string;
  listings: ListingCardDTO[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (!listings.length) return null;

  const scroll = (dir: number) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });

  const arrow = "flex h-8 w-8 items-center justify-center rounded-full border border-border text-lg hover:shadow-pill";

  return (
    <section className="py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-hof">{title}</h2>
        <div className="hidden gap-2 sm:flex">
          <button onClick={() => scroll(-1)} aria-label="Scroll left" className={arrow}>
            ‹
          </button>
          <button onClick={() => scroll(1)} aria-label="Scroll right" className={arrow}>
            ›
          </button>
        </div>
      </div>
      <div ref={ref} className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-2">
        {listings.map((l) => (
          <div
            key={l.id}
            className="w-[42%] shrink-0 sm:w-[30%] md:w-[22%] lg:w-[18%] xl:w-[15.2%]"
          >
            <ListingCard listing={l} />
          </div>
        ))}
      </div>
    </section>
  );
}
