"use client";
import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";
import type { BookedRange } from "@/lib/types";

const iso = (d: Date) => format(d, "yyyy-MM-dd");
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Availability calendar / date-range picker driven by existing bookings:
// past days and booked *nights* are disabled, and a selection that would span a
// booked night is rejected. `checkOut` is exclusive, so the checkout day of an
// existing booking stays selectable (it's a free check-in day).
export default function AvailabilityCalendar({
  booked,
  checkIn,
  checkOut,
  onChange,
}: {
  booked: BookedRange[];
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}) {
  const today = startOfDay(new Date());
  const [view, setView] = useState<Date>(startOfMonth(today));

  // Set of ISO days occupied as a booked night (checkIn .. checkOut-1).
  const blocked = useMemo(() => {
    const s = new Set<string>();
    for (const r of booked) {
      const start = parseISO(r.checkIn);
      const lastNight = addDays(parseISO(r.checkOut), -1);
      if (isBefore(lastNight, start)) continue;
      for (const d of eachDayOfInterval({ start, end: lastNight })) s.add(iso(d));
    }
    return s;
  }, [booked]);

  const isPast = (d: Date) => isBefore(d, today);
  const isBlocked = (d: Date) => blocked.has(iso(d));
  const inRange = (d: Date) =>
    checkIn && checkOut && iso(d) >= checkIn && iso(d) <= checkOut;

  const click = (d: Date) => {
    if (isPast(d) || isBlocked(d)) return;
    const s = iso(d);
    if (!checkIn || (checkIn && checkOut)) {
      onChange(s, "");
      return;
    }
    const ci = parseISO(checkIn);
    if (!isAfter(d, ci)) {
      onChange(s, "");
      return;
    }
    // Reject a range that would span a booked night.
    const nights = eachDayOfInterval({ start: ci, end: addDays(d, -1) });
    if (nights.some((n) => blocked.has(iso(n)))) {
      onChange(s, "");
      return;
    }
    onChange(checkIn, s);
  };

  const firstDay = startOfMonth(view);
  const days = eachDayOfInterval({ start: firstDay, end: endOfMonth(view) });
  const leadingBlanks = getDay(firstDay);
  const canGoPrev = isAfter(firstDay, startOfMonth(today));

  return (
    <div className="rounded-lg border border-line p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => canGoPrev && setView(addMonths(view, -1))}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="px-2 py-1 text-lg disabled:opacity-30"
        >
          ‹
        </button>
        <span className="text-sm font-medium">{format(view, "MMMM yyyy")}</span>
        <button
          onClick={() => setView(addMonths(view, 1))}
          aria-label="Next month"
          className="px-2 py-1 text-lg"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {days.map((d) => {
          const disabled = isPast(d) || isBlocked(d);
          const selected = iso(d) === checkIn || iso(d) === checkOut;
          return (
            <button
              key={iso(d)}
              onClick={() => click(d)}
              disabled={disabled}
              aria-label={format(d, "PPP")}
              className={[
                "aspect-square rounded-md text-xs transition",
                disabled ? "cursor-not-allowed text-muted line-through" : "hover:bg-bg-soft",
                selected ? "bg-brand text-white hover:bg-brand" : "",
                inRange(d) && !selected ? "bg-brand/10" : "",
              ].join(" ")}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
