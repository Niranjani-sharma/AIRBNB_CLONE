import { Suspense } from "react";
import ListingGrid from "@/components/cards/ListingGrid";
import CategoryRow from "@/components/filters/CategoryRow";
import FilterBar from "@/components/filters/FilterBar";
import Pagination from "@/components/cards/Pagination";
import SearchBar from "@/components/search/SearchBar";
import ResultsMap from "@/components/listing/ResultsMap";
import { getListings } from "@/lib/listings-server";

export const dynamic = "force-dynamic";

// Search results (§7.3): query-string driven grid + pagination + map, with the
// category strip and filters to refine (all reflected in the URL).
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const data = await getListings(searchParams);
  const items = data.items ?? [];
  const where = typeof searchParams.location === "string" ? searchParams.location : "";

  return (
    <div>
      <div className="flex justify-center py-5">
        <div className="w-full max-w-3xl">
          <Suspense fallback={<div className="h-16" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      <div className="sticky top-[65px] z-30 -mx-6 flex items-center gap-6 border-b border-line bg-bg px-6 pt-3 md:-mx-10 md:px-10">
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

      <p className="pt-6 text-sm text-muted">
        {data.total} {data.total === 1 ? "stay" : "stays"}
        {where ? ` in ${where}` : ""}
      </p>

      <Suspense fallback={null}>
        <ResultsMap listings={items} />
      </Suspense>

      <ListingGrid listings={items} />
      <Suspense fallback={null}>
        <Pagination page={data.page} totalPages={data.totalPages} total={data.total} />
      </Suspense>
    </div>
  );
}
