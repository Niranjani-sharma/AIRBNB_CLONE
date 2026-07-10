"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { AvailabilityDTO, DateRange, ListingDetailDTO, PriceQuoteDTO } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";

export default function BookingCard({ listing }: { listing: ListingDetailDTO }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [booked, setBooked] = useState<DateRange[]>([]);
  const [quote, setQuote] = useState<PriceQuoteDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get(`/listings/${listing.id}/availability`)
      .then((r) => setBooked((r.data as AvailabilityDTO).booked ?? []))
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

  const reserve = async () => {
    if (!getToken()) {
      toast.error("Log in to book");
      router.push("/login");
      return;
    }
    try {
      setLoading(true);
      await api.post("/bookings", {
        listingId: listing.id,
        checkIn,
        checkOut,
        guestsCount: guests,
      });
      toast.success("Booking confirmed!");
      router.push("/trips");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const box = "rounded-lg border border-border px-3 py-2";

  return (
    <div className="sticky top-28 rounded-2xl border border-border p-6 shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
      <p className="mb-4 flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{formatMoney(listing.pricePerNight)}</span>
        <span className="text-foggy">night</span>
      </p>

      {/* Selected-dates summary in Airbnb's two-box style */}
      <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-lg border border-border">
        <div className="border-r border-border px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-hof">Check-in</p>
          <p className="text-sm text-foggy">{checkIn || "Add date"}</p>
        </div>
        <div className="px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-hof">Checkout</p>
          <p className="text-sm text-foggy">{checkOut || "Add date"}</p>
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
        <span className="text-[10px] font-semibold uppercase text-hof">Guests</span>
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
        disabled={loading || !quote}
        className="mt-4 w-full rounded-lg bg-rausch py-3 font-semibold text-white transition hover:bg-rausch-dark disabled:opacity-50"
      >
        {loading ? "Reserving…" : "Reserve"}
      </button>
      <p className="mt-2 text-center text-xs text-foggy">You won&apos;t be charged yet</p>

      {quote && (
        <div className="mt-5 space-y-3 text-sm">
          <Row
            label={`${formatMoney(quote.nightlyRate)} × ${quote.nights} nights`}
            value={formatMoney(quote.subtotal)}
          />
          <Row label="Cleaning fee" value={formatMoney(quote.cleaningFee)} />
          <Row label="Service fee" value={formatMoney(quote.serviceFee)} />
          <Row label="Taxes" value={formatMoney(quote.taxes)} />
          <div className="border-t border-border pt-3">
            <Row label="Total" value={formatMoney(quote.total)} bold />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-hof" : "text-foggy"}`}>
      <span className={bold ? "" : "underline decoration-transparent"}>{label}</span>
      <span className="text-hof">{value}</span>
    </div>
  );
}
