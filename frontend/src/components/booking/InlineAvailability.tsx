"use client";
import { useState } from "react";
import { addMonths, format, isAfter, parseISO, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CalendarMonth from "./CalendarMonth";
import { useReservation } from "@/lib/reservation-context";

// Section G: inline two-month calendar in the left column, sharing state with the
// reservation card via the reservation context.
export default function InlineAvailability({ city }: { city: string }) {
  const { checkIn, checkOut, nights, clearDates } = useReservation();
  const [view, setView] = useState(() => startOfMonth(new Date()));

  const fmt = (s: string) => format(parseISO(s), "d MMM yyyy");
  const title =
    nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"} in ${city}` : "Select check-in date";
  const subtitle =
    checkIn && checkOut
      ? `${fmt(checkIn)} – ${fmt(checkOut)}`
      : checkIn
      ? `${fmt(checkIn)} – add checkout`
      : "Add your travel dates for exact pricing";

  const canPrev = isAfter(startOfMonth(view), startOfMonth(new Date()));
  const navBtn =
    "flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg-soft disabled:opacity-30";

  return (
    <section className="border-b border-line-soft py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        {(checkIn || checkOut) && (
          <button onClick={clearDates} className="shrink-0 text-sm font-semibold text-ink underline">
            Clear dates
          </button>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => canPrev && setView(addMonths(view, -1))}
          disabled={!canPrev}
          aria-label="Previous month"
          className={`absolute left-0 top-0 ${navBtn}`}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setView(addMonths(view, 1))}
          aria-label="Next month"
          className={`absolute right-0 top-0 ${navBtn}`}
        >
          <ChevronRight size={18} />
        </button>
        <div className="grid grid-cols-1 gap-10 px-10 md:grid-cols-2">
          <CalendarMonth month={view} />
          <CalendarMonth month={addMonths(view, 1)} />
        </div>
      </div>
    </section>
  );
}
