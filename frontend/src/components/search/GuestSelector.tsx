"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// Guest breakdown. Only adults + children count toward the API `guests` number;
// infants and pets are tracked for the summary line but never sent as guests.
export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export const emptyGuests: GuestCounts = { adults: 0, children: 0, infants: 0, pets: 0 };

// "2 guests, 1 infant, 1 pet" — infants/pets appended only when > 0.
export function guestSummary(c: GuestCounts, emptyLabel = "Add guests"): string {
  const g = c.adults + c.children;
  if (g <= 0) return emptyLabel;
  const parts = [`${g} guest${g > 1 ? "s" : ""}`];
  if (c.infants > 0) parts.push(`${c.infants} infant${c.infants > 1 ? "s" : ""}`);
  if (c.pets > 0) parts.push(`${c.pets} pet${c.pets > 1 ? "s" : ""}`);
  return parts.join(", ");
}

function StepButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-lg leading-none text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:border-line-soft disabled:text-line disabled:hover:border-line-soft"
    >
      {children}
    </button>
  );
}

// The four stepper rows + (optional) max-guests note. Shared by the reservation
// card field and the home search "Who" segment.
export function GuestRows({
  value,
  onChange,
  maxGuests,
  minAdults = 1,
}: {
  value: GuestCounts;
  onChange: (c: GuestCounts) => void;
  maxGuests?: number;
  minAdults?: number;
}) {
  const total = value.adults + value.children;
  const capReached = maxGuests != null && total >= maxGuests;
  const set = (k: keyof GuestCounts, v: number) => onChange({ ...value, [k]: v });

  const rows: {
    key: keyof GuestCounts;
    title: string;
    subtitle: React.ReactNode;
    min: number;
    countsToCap: boolean;
  }[] = [
    { key: "adults", title: "Adults", subtitle: "Age 13+", min: minAdults, countsToCap: true },
    { key: "children", title: "Children", subtitle: "Ages 2–12", min: 0, countsToCap: true },
    { key: "infants", title: "Infants", subtitle: "Under 2", min: 0, countsToCap: false },
    {
      key: "pets",
      title: "Pets",
      subtitle: (
        <span className="underline underline-offset-2">Bringing a service animal?</span>
      ),
      min: 0,
      countsToCap: false,
    },
  ];

  return (
    <div>
      <div className="divide-y divide-line-soft">
        {rows.map((r) => {
          const v = value[r.key];
          return (
            <div key={r.key} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-ink">{r.title}</p>
                <p className="text-sm text-muted">{r.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <StepButton
                  label={`Decrease ${r.title}`}
                  disabled={v <= r.min}
                  onClick={() => set(r.key, Math.max(r.min, v - 1))}
                >
                  −
                </StepButton>
                <span className="w-6 text-center tabular-nums text-ink">{v}</span>
                <StepButton
                  label={`Increase ${r.title}`}
                  disabled={r.countsToCap && capReached}
                  onClick={() => set(r.key, v + 1)}
                >
                  +
                </StepButton>
              </div>
            </div>
          );
        })}
      </div>
      {maxGuests != null && (
        <p className="pt-4 text-sm text-muted">
          This place has a maximum of {maxGuests} guests, not including infants.
        </p>
      )}
    </div>
  );
}

// A self-contained field (label + summary + chevron) that opens the guest popover.
// Used by the reservation card; closes on outside-click / Esc.
export default function GuestField({
  value,
  onChange,
  maxGuests,
}: {
  value: GuestCounts;
  onChange: (c: GuestCounts) => void;
  maxGuests: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase text-ink">Guests</span>
          <span className="text-sm text-muted">{guestSummary(value, "1 guest")}</span>
        </span>
        <ChevronDown
          size={18}
          className={`text-ink transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Guests"
          className="pop absolute right-0 top-[calc(100%+8px)] z-50 w-full min-w-[320px] rounded-2xl border border-line-soft bg-bg p-6 shadow-[0_6px_24px_rgba(0,0,0,0.18)]"
        >
          <GuestRows value={value} onChange={onChange} maxGuests={maxGuests} />
        </div>
      )}
    </div>
  );
}
