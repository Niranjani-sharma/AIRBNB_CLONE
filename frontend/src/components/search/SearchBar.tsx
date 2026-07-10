"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import SearchCalendar from "./SearchCalendar";

// Seed cities double as destination suggestions.
const DESTINATIONS = [
  "Los Angeles", "New York", "Miami", "Malibu", "Aspen", "Lake Tahoe",
  "Napa", "Chicago", "San Diego", "Palm Springs", "Seattle", "Austin",
  "Denver", "Portland", "Nashville", "Boston",
];

type Panel = "where" | "when" | "who" | null;

function Stepper({
  label,
  hint,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-full border border-muted text-lg text-muted transition hover:border-ink hover:text-ink disabled:opacity-30";
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-medium text-ink">{label}</p>
        <p className="text-sm text-muted">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Decrease ${label}`}>
          −
        </button>
        <span className="w-5 text-center">{value}</span>
        <button className={btn} onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState<Panel>(null);
  const [location, setLocation] = useState(sp.get("location") || "");
  const [checkIn, setCheckIn] = useState(sp.get("check_in") || "");
  const [checkOut, setCheckOut] = useState(sp.get("check_out") || "");
  const [adults, setAdults] = useState(Math.max(1, Number(sp.get("guests")) || 1));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);

  const guests = adults + children;
  const fmt = (s: string) => format(parseISO(s), "d MMM");
  const dateLabel = checkIn && checkOut ? `${fmt(checkIn)} – ${fmt(checkOut)}` : "Add dates";
  const guestLabel =
    guests > 0 ? `${guests} guest${guests > 1 ? "s" : ""}${infants ? ` · ${infants} infant${infants > 1 ? "s" : ""}` : ""}` : "Add guests";

  const submit = () => {
    const p = new URLSearchParams();
    if (location) p.set("location", location);
    if (checkIn) p.set("check_in", checkIn);
    if (checkOut) p.set("check_out", checkOut);
    if (guests > 0) p.set("guests", String(guests));
    p.set("page", "1");
    setOpen(null);
    router.push(`/s?${p.toString()}`);
  };

  const seg = (id: Panel, label: string, value: string, filled: boolean, extra = "") =>
    `flex flex-col justify-center rounded-full px-6 py-2.5 text-left transition ${extra} ${
      open === id ? "bg-bg shadow-pill" : "hover:bg-bg-soft/60"
    }`;

  const valueClass = (filled: boolean) => `truncate text-sm ${filled ? "text-ink" : "text-muted"}`;

  return (
    <div className="relative">
      <div
        className={`flex items-center rounded-pill border border-line transition ${
          open ? "bg-bg-soft" : "bg-bg"
        } ${compact ? "shadow-pill" : "shadow-card"}`}
      >
        <button className={seg("where", "", "", false)} onClick={() => setOpen(open === "where" ? null : "where")}>
          <span className="text-[11px] font-semibold text-ink">Where</span>
          <span className={valueClass(!!location)}>{location || "Search destinations"}</span>
        </button>
        <span className="h-8 w-px bg-line" />
        <button className={seg("when", "", "", false)} onClick={() => setOpen(open === "when" ? null : "when")}>
          <span className="text-[11px] font-semibold text-ink">When</span>
          <span className={valueClass(!!(checkIn && checkOut))}>{dateLabel}</span>
        </button>
        <span className="h-8 w-px bg-line" />
        <button className={seg("who", "", "", false, "flex-1")} onClick={() => setOpen(open === "who" ? null : "who")}>
          <span className="text-[11px] font-semibold text-ink">Who</span>
          <span className={valueClass(guests > 0)}>{guestLabel}</span>
        </button>
        <button
          onClick={submit}
          aria-label="Search"
          className="mx-1.5 flex h-11 items-center gap-2 rounded-full bg-brand px-3.5 font-medium text-white transition hover:bg-brand-dark"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          {open && <span className="pr-1 text-sm">Search</span>}
        </button>
      </div>

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(null)} />}

      {/* WHERE */}
      {open === "where" && (
        <div className="pop absolute left-0 top-[calc(100%+12px)] z-50 max-h-[60vh] w-[380px] overflow-y-auto rounded-3xl border border-line bg-bg p-5 shadow-[0_6px_24px_rgba(0,0,0,0.15)]">
          <input
            autoFocus
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search destinations"
            className="mb-4 w-full rounded-lg border border-line p-3 text-sm outline-none focus:border-ink"
          />
          <p className="mb-2 text-xs font-semibold uppercase text-muted">Suggested destinations</p>
          <ul>
            {DESTINATIONS.filter((d) => d.toLowerCase().includes(location.toLowerCase())).map((d) => (
              <li key={d}>
                <button
                  onClick={() => {
                    setLocation(d);
                    setOpen("when");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-bg-soft"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-soft" aria-hidden>📍</span>
                  {d}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* WHEN */}
      {open === "when" && (
        <div className="pop absolute left-1/2 top-[calc(100%+12px)] z-50 w-[92vw] max-w-[640px] -translate-x-1/2 rounded-3xl border border-line bg-bg p-6 shadow-[0_6px_24px_rgba(0,0,0,0.15)]">
          <SearchCalendar
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(ci, co) => {
              setCheckIn(ci);
              setCheckOut(co);
              if (ci && co) setOpen("who");
            }}
          />
        </div>
      )}

      {/* WHO */}
      {open === "who" && (
        <div className="pop absolute right-0 top-[calc(100%+12px)] z-50 w-[380px] rounded-3xl border border-line bg-bg px-6 py-2 shadow-[0_6px_24px_rgba(0,0,0,0.15)]">
          <div className="divide-y divide-line">
            <Stepper label="Adults" hint="Ages 13 or above" value={adults} onChange={setAdults} min={1} />
            <Stepper label="Children" hint="Ages 2–12" value={children} onChange={setChildren} />
            <Stepper label="Infants" hint="Under 2" value={infants} onChange={setInfants} />
            <Stepper label="Pets" hint="Service animals welcome" value={pets} onChange={setPets} />
          </div>
        </div>
      )}
    </div>
  );
}
