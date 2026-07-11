"use client";
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import { useReservation } from "@/lib/reservation-context";

const iso = (d: Date) => format(d, "yyyy-MM-dd");
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// One month grid wired to the shared reservation state.
export default function CalendarMonth({ month }: { month: Date }) {
  const { checkIn, checkOut, isDisabled, inRange, selectDay } = useReservation();
  const first = startOfMonth(month);
  const days = eachDayOfInterval({ start: first, end: endOfMonth(month) });
  const blanks = getDay(first);

  return (
    <div>
      <p className="mb-3 text-center text-sm font-semibold text-ink">{format(month, "MMMM yyyy")}</p>
      <div className="grid grid-cols-7 text-center text-[11px] text-muted">
        {WEEKDAYS.map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: blanks }).map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {days.map((d) => {
          const disabled = isDisabled(d);
          const selected = iso(d) === checkIn || iso(d) === checkOut;
          return (
            <button
              key={iso(d)}
              disabled={disabled}
              onClick={() => selectDay(d)}
              aria-label={format(d, "PPP")}
              className={`aspect-square rounded-full text-xs transition ${
                disabled ? "cursor-not-allowed text-muted/40 line-through" : "hover:bg-bg-soft"
              } ${selected ? "bg-ink text-bg hover:bg-ink" : ""} ${
                inRange(d) && !selected ? "bg-bg-soft" : ""
              }`}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
