import { Suspense } from "react";
import CategoryRow from "@/components/filters/CategoryRow";
import FilterBar from "@/components/filters/FilterBar";
import SearchBar from "@/components/search/SearchBar";
import HomeCarousel from "@/components/home/HomeCarousel";
import { getListings } from "@/lib/listings-server";
import type { ListingCard } from "@/lib/types";

export const dynamic = "force-dynamic";

// Landing "Popular …" rows, grouped by property type.
const GROUPS: { type: string; title: string }[] = [
  { type: "apartment", title: "Popular apartments" },
  { type: "house", title: "Spacious houses" },
  { type: "villa", title: "Luxury villas" },
  { type: "cabin", title: "Cabins to escape to" },
  { type: "cottage", title: "Charming cottages" },
];

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  // "all" shows everything; "homes" is scoped to home listings. All current
  // listings are homes, so both render the same for now — when Experiences /
  // Services content is added under "all", gate it out of the "homes" view here.
  const tab = searchParams.tab === "homes" ? "homes" : "all";

  const data = await getListings({ limit: "48" });
  const items = data.items ?? [];
  const groups = GROUPS.map((g) => ({
    ...g,
    items: items.filter((l: ListingCard) => l.propertyType === g.type),
  })).filter((g) => g.items.length > 0);

  return (
    <div data-tab={tab}>
      {/* Big centered search */}
      <div className="flex justify-center py-5">
        <div className="w-full max-w-3xl">
          <Suspense fallback={<div className="h-16" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      {/* Sticky category strip + filters (both navigate to /s) */}
      <div className="sticky top-[65px] z-30 -mx-6 flex items-center gap-6 border-b border-line bg-bg px-6 pt-3 md:-mx-10 md:px-10 lg:-mx-20 lg:px-20">
        <div className="min-w-0 flex-1">
          <Suspense fallback={<div className="h-14" />}>
            <CategoryRow />
          </Suspense>
        </div>
        <div className="pb-3">
          <Suspense fallback={null}>
            <FilterBar />
          </Suspense>
        </div>
      </div>

      {/* Explore carousels */}
      <div className="pt-2">
        {groups.map((g) => (
          <HomeCarousel key={g.type} title={g.title} listings={g.items} />
        ))}
      </div>
    </div>
  );
}
