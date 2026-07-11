"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

export interface CityEntry {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

// Demo affordance only — a static list, not a real geocoder. Seeded with the
// cities in our data plus a few common ones (incl. some Indian cities).
export const CITIES: CityEntry[] = [
  { city: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437 },
  { city: "New York", country: "USA", lat: 40.7128, lng: -74.006 },
  { city: "Miami", country: "USA", lat: 25.7617, lng: -80.1918 },
  { city: "Malibu", country: "USA", lat: 34.0259, lng: -118.7798 },
  { city: "Aspen", country: "USA", lat: 39.1911, lng: -106.8175 },
  { city: "Lake Tahoe", country: "USA", lat: 39.0968, lng: -120.0324 },
  { city: "Napa", country: "USA", lat: 38.2975, lng: -122.2869 },
  { city: "Chicago", country: "USA", lat: 41.8781, lng: -87.6298 },
  { city: "San Diego", country: "USA", lat: 32.7157, lng: -117.1611 },
  { city: "Palm Springs", country: "USA", lat: 33.8303, lng: -116.5453 },
  { city: "Seattle", country: "USA", lat: 47.6062, lng: -122.3321 },
  { city: "Austin", country: "USA", lat: 30.2672, lng: -97.7431 },
  { city: "Denver", country: "USA", lat: 39.7392, lng: -104.9903 },
  { city: "Portland", country: "USA", lat: 45.5152, lng: -122.6784 },
  { city: "Nashville", country: "USA", lat: 36.1627, lng: -86.7816 },
  { city: "Boston", country: "USA", lat: 42.3601, lng: -71.0589 },
  { city: "Dehradun", country: "India", lat: 30.3165, lng: 78.0322 },
  { city: "Mumbai", country: "India", lat: 19.076, lng: 72.8777 },
  { city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
  { city: "Goa", country: "India", lat: 15.2993, lng: 74.124 },
];

export default function CityAutocomplete({
  value,
  onCityChange,
  onSelect,
  inputClass,
}: {
  value: string;
  onCityChange: (city: string) => void;
  onSelect: (entry: CityEntry) => void;
  inputClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const q = value.trim().toLowerCase();
  const matches = q
    ? CITIES.filter((c) => c.city.toLowerCase().includes(q))
        .sort(
          (a, b) =>
            Number(b.city.toLowerCase().startsWith(q)) - Number(a.city.toLowerCase().startsWith(q))
        )
        .slice(0, 6)
    : [];
  const show = open && matches.length > 0;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const choose = (c: CityEntry) => {
    onSelect(c);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (!show) {
      if (e.key === "ArrowDown") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(matches.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choose(matches[active]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <input
        value={value}
        onChange={(e) => {
          onCityChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => value && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="e.g. Los Angeles"
        className={inputClass}
        role="combobox"
        aria-expanded={show}
        aria-autocomplete="list"
        autoComplete="off"
      />
      {show && (
        <ul
          role="listbox"
          className="pop absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-line-soft bg-bg py-1 shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
        >
          {matches.map((c, i) => (
            <li key={c.city} role="option" aria-selected={i === active}>
              <button
                type="button"
                // Keep input focus so the click lands before any blur handling.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(c)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm ${
                  i === active ? "bg-bg-soft" : "hover:bg-bg-soft"
                }`}
              >
                <MapPin size={16} className="shrink-0 text-muted" aria-hidden />
                <span className="text-ink">{c.city}</span>
                <span className="text-muted">{c.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
