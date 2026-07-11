"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Composable refine controls (price range + amenities + sort). Everything is
// reflected in the URL query params so filters compose with search/category and
// the grid is filtered server-side. Prices are entered in rupees, stored/sent
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

  // Values shown/entered in rupees; the API stores/filters in cents.
  const centsToRupees = (v: string | null) => (v ? String(Number(v) / 100) : "");
  const [minPrice, setMinPrice] = useState(centsToRupees(sp.get("min_price")));
  const [maxPrice, setMaxPrice] = useState(centsToRupees(sp.get("max_price")));
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
    const rupeesToCents = (v: string) => (v ? String(Math.round(Number(v) * 100)) : "");
    const set = (k: string, v: string) => (v ? params.set(k, v) : params.delete(k));
    set("min_price", rupeesToCents(minPrice));
    set("max_price", rupeesToCents(maxPrice));
    set("sort", sort !== "newest" ? sort : "");
    params.delete("amenities");
    amenities.forEach((a) => params.append("amenities", a));
    params.set("page", "1");
    router.push(`/s?${params.toString()}`);
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
    router.push(`/s?${params.toString()}`);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm hover:shadow-pill"
      >
        <span aria-hidden>⚙</span> Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-ink px-2 text-xs text-bg">{activeCount}</span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-card bg-bg p-6"
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
              <div className="flex w-full items-center rounded-lg border border-line px-2">
                <span className="text-sm text-muted">₹</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-transparent p-2 text-sm text-ink outline-none"
                />
              </div>
              <span className="text-muted">–</span>
              <div className="flex w-full items-center rounded-lg border border-line px-2">
                <span className="text-sm text-muted">₹</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-transparent p-2 text-sm text-ink outline-none"
                />
              </div>
            </div>

            <h3 className="mb-2 text-sm font-medium">Sort by</h3>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mb-6 w-full rounded-lg border border-line bg-bg p-2 text-sm text-ink"
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
                      ? "border-ink bg-ink text-bg"
                      : "border-line text-muted hover:border-ink"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-line pt-4">
              <button onClick={clear} className="text-sm font-medium underline">
                Clear all
              </button>
              <button
                onClick={apply}
                className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-white"
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
