"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Composable refine controls (price range + amenities + sort). Everything is
// reflected in the URL query params so filters compose with search/category and
// the grid is filtered server-side. Prices are entered in dollars, stored/sent
// as cents to match the API.
const AMENITIES = [
  "WiFi", "Kitchen", "Pool", "Hot tub", "Free parking", "Air conditioning",
  "Heating", "Washer", "TV", "Workspace", "Gym", "Beach access",
  "Fireplace", "Pets allowed", "EV charger",
];

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export default function FilterBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  const centsToDollars = (v: string | null) => (v ? String(Number(v) / 100) : "");
  const [minPrice, setMinPrice] = useState(centsToDollars(sp.get("min_price")));
  const [maxPrice, setMaxPrice] = useState(centsToDollars(sp.get("max_price")));
  const [sort, setSort] = useState(sp.get("sort") || "newest");
  const [amenities, setAmenities] = useState<string[]>(sp.getAll("amenities"));

  const activeCount =
    (sp.get("min_price") ? 1 : 0) +
    (sp.get("max_price") ? 1 : 0) +
    (sp.get("sort") && sp.get("sort") !== "newest" ? 1 : 0) +
    sp.getAll("amenities").length;

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const apply = () => {
    const params = new URLSearchParams(sp.toString());
    const dollarsToCents = (v: string) => (v ? String(Math.round(Number(v) * 100)) : "");
    const set = (k: string, v: string) => (v ? params.set(k, v) : params.delete(k));
    set("min_price", dollarsToCents(minPrice));
    set("max_price", dollarsToCents(maxPrice));
    set("sort", sort !== "newest" ? sort : "");
    params.delete("amenities");
    amenities.forEach((a) => params.append("amenities", a));
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
    setOpen(false);
  };

  const clear = () => {
    const params = new URLSearchParams(sp.toString());
    ["min_price", "max_price", "sort", "amenities"].forEach((k) => params.delete(k));
    params.set("page", "1");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setAmenities([]);
    router.push(`/?${params.toString()}`);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:shadow-pill"
      >
        <span aria-hidden>⚙</span> Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-hof px-2 text-xs text-white">{activeCount}</span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-2xl leading-none">
                ×
              </button>
            </div>

            <h3 className="mb-2 text-sm font-medium">Price range (per night)</h3>
            <div className="mb-6 flex items-center gap-3">
              <input
                type="number"
                min={0}
                placeholder="Min $"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-lg border border-border p-2 text-sm"
              />
              <span className="text-foggy">–</span>
              <input
                type="number"
                min={0}
                placeholder="Max $"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-border p-2 text-sm"
              />
            </div>

            <h3 className="mb-2 text-sm font-medium">Sort by</h3>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mb-6 w-full rounded-lg border border-border p-2 text-sm"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <h3 className="mb-2 text-sm font-medium">Amenities</h3>
            <div className="mb-6 flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`rounded-pill border px-3 py-1 text-sm ${
                    amenities.includes(a)
                      ? "border-hof bg-hof text-white"
                      : "border-border text-foggy hover:border-hof"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <button onClick={clear} className="text-sm font-medium underline">
                Clear all
              </button>
              <button
                onClick={apply}
                className="rounded-lg bg-rausch px-6 py-2 text-sm font-medium text-white"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
