"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addMonths, format, isAfter, parseISO, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useToast } from "@/lib/toast-context";
import { useReservation } from "@/lib/reservation-context";
import CalendarMonth from "./CalendarMonth";
import GuestField, { type GuestCounts } from "@/components/search/GuestSelector";
import { formatMoney } from "@/lib/money";
import type { ListingDetail, Quote } from "@/lib/types";

export default function ReservationCard({ listing }: { listing: ListingDetail }) {
  const router = useRouter();
  const toast = useToast();
  const { checkIn, checkOut, focus, setFocus, guests, setGuests, maxGuests, clearDates } =
    useReservation();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => startOfMonth(new Date()));

  // Full guest breakdown lives here; only adults + children collapse to the API
  // `guests` number, which the shared reservation state (and /quote) consume.
  const [gc, setGc] = useState<GuestCounts>({ adults: 1, children: 0, infants: 0, pets: 0 });
  useEffect(() => {
    setGuests(gc.adults + gc.children);
  }, [gc, setGuests]);

  // Server-authored quote whenever a full range is selected.
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setQuote(null);
      return;
    }
    let active = true;
    api
      .post(`/listings/${listing.id}/quote`, { checkIn, checkOut, guests })
      .then((r) => active && setQuote(r.data))
      .catch((e: any) => {
        if (active) {
          setQuote(null);
          toast.error(e.message);
        }
      });
    return () => {
      active = false;
    };
  }, [checkIn, checkOut, guests, listing.id, toast]);

  // Close the popover once a full range is chosen.
  useEffect(() => {
    if (checkIn && checkOut) setOpen(false);
  }, [checkIn, checkOut]);

  const reserve = () => {
    if (!getToken()) {
      toast.error("Log in to book");
      router.push("/login");
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error("Select your dates");
      setOpen(true);
      return;
    }
    const p = new URLSearchParams({ check_in: checkIn, check_out: checkOut, guests: String(guests) });
    router.push(`/book/${listing.id}?${p.toString()}`);
  };

  const fmt = (s: string) => (s ? format(parseISO(s), "d MMM") : "Add date");
  const canPrev = isAfter(startOfMonth(view), startOfMonth(new Date()));
  const dateBox = (field: "checkIn" | "checkOut", label: string, value: string) => (
    <button
      onClick={() => {
        setFocus(field);
        setOpen(true);
      }}
      className={`flex flex-col px-3 py-2 text-left ${
        open && focus === field ? "rounded-lg ring-2 ring-ink" : ""
      }`}
    >
      <span className="text-[10px] font-semibold uppercase text-ink">{label}</span>
      <span className="text-sm text-muted">{value}</span>
    </button>
  );

  return (
    <div className="sticky top-28 rounded-2xl border border-line p-6 shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
      <p className="mb-4 flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{formatMoney(listing.pricePerNight)}</span>
        <span className="text-muted">night</span>
      </p>

      <div className="rounded-lg border border-line">
        <div className="grid grid-cols-2 divide-x divide-line">
          {dateBox("checkIn", "Check-in", fmt(checkIn))}
          {dateBox("checkOut", "Checkout", fmt(checkOut))}
        </div>
        <div className="border-t border-line">
          <GuestField value={gc} onChange={setGc} maxGuests={maxGuests} />
        </div>
      </div>

      {open && (
        <div className="mt-3 rounded-xl border border-line p-3">
          <div className="mb-2 flex items-center justify-between">
            <button onClick={() => canPrev && setView(addMonths(view, -1))} disabled={!canPrev} aria-label="Previous month" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-bg-soft disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium text-muted">Select your dates</span>
            <button onClick={() => setView(addMonths(view, 1))} aria-label="Next month" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-bg-soft">
              <ChevronRight size={16} />
            </button>
          </div>
          <CalendarMonth month={view} />
          <div className="mt-2 flex justify-end">
            <button onClick={clearDates} className="text-xs font-semibold underline">
              Clear dates
            </button>
          </div>
        </div>
      )}

      <button
        onClick={reserve}
        className="mt-4 w-full rounded-lg bg-brand-gradient py-3 font-semibold text-white transition hover:brightness-95"
      >
        Reserve
      </button>
      <p className="mt-2 text-center text-xs text-muted">You won&apos;t be charged yet</p>

      {quote && (
        <div className="mt-5 space-y-3 text-sm">
          <Row label={`${formatMoney(quote.nightlyRate)} × ${quote.nights} nights`} value={formatMoney(quote.subtotal)} />
          <Row label="Cleaning fee" value={formatMoney(quote.cleaningFee)} />
          <Row label="Service fee" value={formatMoney(quote.serviceFee)} />
          <Row label="Taxes" value={formatMoney(quote.taxes)} />
          <div className="border-t border-line pt-3">
            <Row label="Total" value={formatMoney(quote.total)} bold />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-ink" : "text-muted"}`}>
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
