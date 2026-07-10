"use client";
import { useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";

// Collapsed search summary shown in the header once the page is scrolled
// (Airbnb pattern). Clicking it scrolls back to the full search bar.
export default function CompactSearchPill({ onClick }: { onClick: () => void }) {
  const sp = useSearchParams();
  const location = sp.get("location") || "Anywhere";
  const ci = sp.get("check_in");
  const co = sp.get("check_out");
  const dates = ci && co ? `${format(parseISO(ci), "d MMM")} – ${format(parseISO(co), "d MMM")}` : "Anytime";
  const guestsNum = Number(sp.get("guests"));
  const who = guestsNum > 0 ? `${guestsNum} guest${guestsNum > 1 ? "s" : ""}` : "Add guests";

  return (
    <button
      onClick={onClick}
      className="pop flex items-center gap-3 rounded-pill border border-line bg-bg py-2 pl-5 pr-2 text-sm font-medium shadow-pill transition hover:shadow-card"
    >
      <span className="text-ink">{location}</span>
      <span className="h-5 w-px bg-line" />
      <span className="text-ink">{dates}</span>
      <span className="h-5 w-px bg-line" />
      <span className="text-muted">{who}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
      </span>
    </button>
  );
}
