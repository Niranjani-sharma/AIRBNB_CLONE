"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Availability, BookedRange, ListingDetail, Quote } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";

export default function BookingCard({ listing }: { listing: ListingDetail }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [booked, setBooked] = useState<BookedRange[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    api
      .get(`/listings/${listing.id}/availability`)
      .then((r) => setBooked((r.data as Availability).booked ?? []))
      .catch(() => setBooked([]));
  }, [listing.id]);

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
  }, [checkIn, checkOut, guests, listing.id]);

  // Reserve routes to the mocked checkout ("Confirm and pay"); the booking is
  // created there via POST /bookings.
  const reserve = () => {
    if (!getToken()) {
      toast.error("Log in to book");
      router.push("/login");
      return;
    }
    const params = new URLSearchParams({ check_in: checkIn, check_out: checkOut, guests: String(guests) });
    router.push(`/book/${listing.id}?${params.toString()}`);
  };

  const box = "rounded-lg border border-line px-3 py-2";

  return (
    <div className="sticky top-28 rounded-2xl border border-line p-6 shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
      <p className="mb-4 flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{formatMoney(listing.pricePerNight)}</span>
        <span className="text-muted">night</span>
      </p>

      {/* Selected-dates summary in Airbnb's two-box style */}
      <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-lg border border-line">
        <div className="border-r border-line px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-ink">Check-in</p>
          <p className="text-sm text-muted">{checkIn || "Add date"}</p>
        </div>
        <div className="px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-ink">Checkout</p>
          <p className="text-sm text-muted">{checkOut || "Add date"}</p>
        </div>
      </div>

      <AvailabilityCalendar
        booked={booked}
        checkIn={checkIn}
        checkOut={checkOut}
        onChange={(ci, co) => {
          setCheckIn(ci);
          setCheckOut(co);
        }}
      />

      <label className={`mt-3 flex flex-col ${box}`}>
        <span className="text-[10px] font-semibold uppercase text-ink">Guests</span>
        <input
          type="number"
          min={1}
          max={listing.maxGuests}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="bg-transparent text-sm outline-none"
        />
      </label>

      <button
        onClick={reserve}
        disabled={!quote}
        className="mt-4 w-full rounded-lg bg-brand-gradient py-3 font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
      >
        Reserve
      </button>
      <p className="mt-2 text-center text-xs text-muted">You won&apos;t be charged yet</p>

      {quote && (
        <div className="mt-5 space-y-3 text-sm">
          <Row
            label={`${formatMoney(quote.nightlyRate)} × ${quote.nights} nights`}
            value={formatMoney(quote.subtotal)}
          />
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
      <span className={bold ? "" : "underline decoration-transparent"}>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
