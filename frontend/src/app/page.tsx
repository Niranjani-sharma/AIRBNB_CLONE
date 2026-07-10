import { Suspense } from "react";
import ListingGrid from "@/components/cards/ListingGrid";
import CategoryRow from "@/components/filters/CategoryRow";
import FilterBar from "@/components/filters/FilterBar";
import Pagination from "@/components/cards/Pagination";
import SearchBar from "@/components/search/SearchBar";
import HomeCarousel from "@/components/home/HomeCarousel";
import type { ListingCardDTO, ListingListResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

// Filters that mean "the user is actively searching" (→ show grid + pagination).
const FILTER_KEYS = [
  "location", "check_in", "check_out", "guests",
  "property_type", "min_price", "max_price", "amenities", "sort",
];

// Carousel groupings for the landing page, by property type.
const GROUPS: { type: string; title: string }[] = [
  { type: "apartment", title: "Popular apartments" },
  { type: "house", title: "Spacious houses" },
  { type: "villa", title: "Luxury villas" },
  { type: "cabin", title: "Cabins to escape to" },
  { type: "cottage", title: "Charming cottages" },
];

async function getListings(
  searchParams: Record<string, string | string[] | undefined>
): Promise<ListingListResponse> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (Array.isArray(v)) v.forEach((x) => qs.append(k, x));
    else if (v) qs.set(k, v);
  }
  try {
    const res = await fetch(`${API_BASE}/listings?${qs.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    const body = await res.json();
    return body.data as ListingListResponse;
  } catch {
    return { items: [], page: 1, limit: 12, total: 0, totalPages: 0 };
  }
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const hasQuery = FILTER_KEYS.some((k) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  });

  // Landing (no filters): pull the full set so the carousels are well stocked.
  const effective = hasQuery ? searchParams : { ...searchParams, limit: "48" };
  const data = await getListings(effective);
  const items = data.items ?? [];

  const groups = GROUPS.map((g) => ({
    ...g,
    items: items.filter((l: ListingCardDTO) => l.propertyType === g.type),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      {/* Big centered search (Airbnb landing pattern) */}
      <div className="flex justify-center py-5">
        <div className="w-full max-w-3xl">
          <Suspense fallback={<div className="h-16" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      {/* Sticky category strip + filters */}
      <div className="sticky top-[65px] z-30 -mx-6 flex items-center gap-6 border-b border-border bg-white px-6 pt-3 md:-mx-10 md:px-10">
        <div className="min-w-0 flex-1">
          <CategoryRow />
        </div>
        <div className="pb-3">
          <FilterBar />
        </div>
      </div>

      {hasQuery ? (
        <>
          <ListingGrid listings={items} />
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} />
        </>
      ) : (
        <div className="pt-2">
          {groups.map((g) => (
            <HomeCarousel key={g.type} title={g.title} listings={g.items} />
          ))}
        </div>
      )}
    </div>
  );
}
