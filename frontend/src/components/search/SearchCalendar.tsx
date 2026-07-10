"use client";
import { useState } from "react";
import {
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

const iso = (d: Date) => format(d, "yyyy-MM-dd");
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function Month({
  month,
  checkIn,
  checkOut,
  today,
  onPick,
}: {
  month: Date;
  checkIn: string;
  checkOut: string;
  today: Date;
  onPick: (d: Date) => void;
}) {
  const first = startOfMonth(month);
  const days = eachDayOfInterval({ start: first, end: endOfMonth(month) });
  const blanks = getDay(first);
  const inRange = (d: Date) => checkIn && checkOut && iso(d) >= checkIn && iso(d) <= checkOut;

  return (
    <div className="w-[280px]">
      <p className="mb-3 text-center text-sm font-semibold">{format(month, "MMMM yyyy")}</p>
      <div className="grid grid-cols-7 text-center text-[11px] text-foggy">
        {WEEKDAYS.map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: blanks }).map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {days.map((d) => {
          const past = isBefore(d, today);
          const selected = iso(d) === checkIn || iso(d) === checkOut;
          return (
            <button
              key={iso(d)}
              disabled={past}
              onClick={() => onPick(d)}
              className={`aspect-square rounded-full text-xs transition ${
                past ? "cursor-not-allowed text-gray-300 line-through" : "hover:bg-gray-100"
              } ${selected ? "bg-hof text-white hover:bg-hof" : ""} ${
                inRange(d) && !selected ? "bg-gray-100" : ""
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

export default function SearchCalendar({
  checkIn,
  checkOut,
  onChange,
}: {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}) {
  const today = startOfDay(new Date());
  const [view, setView] = useState(startOfMonth(today));

  const pick = (d: Date) => {
    const s = iso(d);
    if (!checkIn || (checkIn && checkOut)) {
      onChange(s, "");
      return;
    }
    if (!isAfter(d, parseISO(checkIn))) {
      onChange(s, "");
      return;
    }
    onChange(checkIn, s);
  };

  const canPrev = isAfter(startOfMonth(view), startOfMonth(today));
  const arrow = "flex h-8 w-8 items-center justify-center rounded-full text-lg hover:bg-gray-100 disabled:opacity-30";

  return (
    <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
      <button
        onClick={() => canPrev && setView(addMonths(view, -1))}
        disabled={!canPrev}
        aria-label="Previous month"
        className={`absolute left-0 top-0 ${arrow}`}
      >
        ‹
      </button>
      <Month month={view} checkIn={checkIn} checkOut={checkOut} today={today} onPick={pick} />
      <div className="hidden sm:block">
        <Month month={addMonths(view, 1)} checkIn={checkIn} checkOut={checkOut} today={today} onPick={pick} />
      </div>
      <button
        onClick={() => setView(addMonths(view, 1))}
        aria-label="Next month"
        className={`absolute right-0 top-0 ${arrow}`}
      >
        ›
      </button>
    </div>
  );
}
