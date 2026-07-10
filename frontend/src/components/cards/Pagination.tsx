"use client";
import { useRouter, useSearchParams } from "next/navigation";

// Server-side pagination controls. Reads total/totalPages from the API and
// writes the `page` query param, preserving all other filters.
export default function Pagination({
  page,
  totalPages,
  total,
}: {
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  if (totalPages <= 1) return null;

  const go = (p: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    router.push(`/?${params.toString()}`);
  };

  // Compact window of page numbers around the current page.
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let p = start; p <= end; p++) pages.push(p);

  const btn = "min-w-9 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40";

  return (
    <nav className="flex flex-col items-center gap-2 py-8" aria-label="Pagination">
      <div className="flex items-center gap-2">
        <button onClick={() => go(page - 1)} disabled={page <= 1} className={btn} aria-label="Previous page">
          ‹ Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${p === page ? "border-hof bg-hof font-semibold text-white" : ""}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className={btn}
          aria-label="Next page"
        >
          Next ›
        </button>
      </div>
      <p className="text-xs text-foggy">
        Page {page} of {totalPages} · {total} stays
      </p>
    </nav>
  );
}
