"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { formatMoney } from "@/lib/money";
import type { ListingDetail, Quote } from "@/lib/types";

// Mocked "Confirm and pay" (the design brief §5.5 / PRD §5.3). No real gateway —
// the price card comes from the server /quote endpoint (source of truth); Confirm
// calls POST /bookings and redirects to Trips.
export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const checkIn = sp.get("check_in") || "";
  const checkOut = sp.get("check_out") || "";
  const guests = Number(sp.get("guests") || 1);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setError("Pick your dates on the listing first.");
      return;
    }
    let active = true;
    Promise.all([
      api.get(`/listings/${id}`),
      api.post(`/listings/${id}/quote`, { checkIn, checkOut, guests }),
    ])
      .then(([l, q]) => {
        if (!active) return;
        setListing(l.data);
        setQuote(q.data);
      })
      .catch((e: any) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [id, checkIn, checkOut, guests]);

  const confirm = async () => {
    try {
      setSubmitting(true);
      await api.post("/bookings", {
        listingId: Number(id),
        checkIn,
        checkOut,
        guestsCount: guests,
      });
      toast.success("Booking confirmed");
      router.push("/trips");
    } catch (e: any) {
      // 409 → dates no longer available; surface and send them back to pick again.
      toast.error(e.message);
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium">{error}</p>
        <Link href={`/rooms/${id}`} className="mt-3 inline-block text-sm underline">
          Back to the listing
        </Link>
      </div>
    );
  }

  const nights = quote?.nights ?? 0;

  return (
    <div className="mx-auto max-w-4xl py-8">
      <h1 className="mb-8 text-2xl font-semibold">Confirm and pay</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: trip details + mocked payment */}
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Your trip</h2>
            <div className="flex items-center justify-between border-b border-line-soft py-3">
              <div>
                <p className="text-sm font-medium">Dates</p>
                <p className="text-sm text-muted">
                  {checkIn} → {checkOut} · {nights} {nights === 1 ? "night" : "nights"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">Guests</p>
                <p className="text-sm text-muted">
                  {guests} {guests === 1 ? "guest" : "guests"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line p-5">
            <h2 className="mb-2 text-lg font-semibold">Payment</h2>
            <p className="text-sm text-muted">
              This is a demo checkout — no card is required and no payment is taken.
            </p>
          </section>

          <button
            onClick={confirm}
            disabled={!quote || submitting}
            className="w-full rounded-lg bg-brand-gradient py-3 font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
          >
            {submitting ? "Confirming…" : "Confirm and pay"}
          </button>
          <p className="text-center text-xs text-muted">You won&apos;t be charged yet</p>
        </div>

        {/* Right: listing summary + price breakdown */}
        <div>
          <div className="sticky top-28 rounded-2xl border border-line p-6 shadow-card">
            {listing && (
              <div className="mb-5 flex gap-4 border-b border-line-soft pb-5">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                  {listing.coverPhoto && (
                    <Image src={listing.coverPhoto} alt={listing.title} fill sizes="96px" className="object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{listing.title}</p>
                  <p className="text-sm text-muted">
                    {listing.city}, {listing.country}
                  </p>
                  {listing.ratingAvg != null && (
                    <p className="mt-1 text-sm">★ {listing.ratingAvg.toFixed(2)} · {listing.ratingCount} reviews</p>
                  )}
                </div>
              </div>
            )}

            <h3 className="mb-3 font-semibold">Price details</h3>
            {quote ? (
              <div className="space-y-3 text-sm">
                <Row label={`${formatMoney(quote.nightlyRate)} × ${quote.nights} nights`} value={formatMoney(quote.subtotal)} />
                <Row label="Cleaning fee" value={formatMoney(quote.cleaningFee)} />
                <Row label="Service fee" value={formatMoney(quote.serviceFee)} />
                <Row label="Taxes" value={formatMoney(quote.taxes)} />
                <div className="border-t border-line pt-3">
                  <Row label="Total (INR)" value={formatMoney(quote.total)} bold />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Loading price…</p>
            )}
          </div>
        </div>
      </div>
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
