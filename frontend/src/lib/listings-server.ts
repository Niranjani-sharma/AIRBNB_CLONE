import type { ListingPage } from "@/lib/types";

// Server-side fetch for public listing data (used by the explore + search pages
// for first paint). Query strings are passed through as snake_case.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export async function getListings(
  searchParams: Record<string, string | string[] | undefined>
): Promise<ListingPage> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (Array.isArray(v)) v.forEach((x) => qs.append(k, x));
    else if (v) qs.set(k, v);
  }
  try {
    const res = await fetch(`${API_BASE}/listings?${qs.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    // API responses are wrapped as { data, message, success }.
    return (await res.json()).data as ListingPage;
  } catch {
    return { items: [], page: 1, limit: 12, total: 0, totalPages: 0 };
  }
}
