"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { formatMoney } from "@/lib/money";
import { formatRating } from "@/lib/rating";
import Modal from "@/components/ui/Modal";
import type { ListingDetail, Quote } from "@/lib/types";

const fmtDate = (s: string) => {
  try {
    return format(parseISO(s), "d MMM");
  } catch {
    return s;
  }
};

// Mocked "Confirm and pay" (design brief §5.5). No real gateway — the price card
// comes from the server /quote endpoint (the single source of truth for totals);
// Confirm calls POST /bookings and redirects to Trips.
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
  const [showBreakdown, setShowBreakdown] = useState(false);

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
      // 409 → those dates were taken between quote and confirm.
      toast.error(e.statusCode === 409 ? "Those dates are no longer available" : e.message);
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

  const favourite = listing?.ratingAvg != null && listing.ratingAvg >= 4.9;
  const guestLabel = `${guests} ${guests === 1 ? "guest" : "guests"}`;

  return (
    <div className="mx-auto max-w-5xl py-8">
      {/* Title row with circular back arrow */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line transition hover:bg-bg-soft"
        >
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <h1 className="text-2xl font-semibold text-ink">Confirm and pay</h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
        {/* LEFT: mocked payment */}
        <div>
          <section className="border-b border-line-soft pb-8">
            <h2 className="text-xl font-semibold text-ink">Proceed to payment</h2>
            <p className="mt-2 text-sm text-muted">
              This is a demo checkout — no card is required and no payment is taken.
            </p>
          </section>

          <p className="mt-8 text-xs text-muted">
            By selecting the button, I agree to the{" "}
            <span className="underline">booking terms</span>.
          </p>

          <button
            onClick={confirm}
            disabled={!quote || submitting}
            className="mt-4 w-full rounded-lg bg-brand-gradient py-3.5 font-semibold text-white transition hover:brightness-95 disabled:opacity-50 sm:w-auto sm:px-10"
          >
            {submitting ? "Confirming…" : "Confirm and pay"}
          </button>
          <p className="mt-3 text-xs text-muted">You won&apos;t be charged yet</p>
        </div>

        {/* RIGHT: sticky summary card */}
        <div>
          <div className="sticky top-28 space-y-4">
            {/* Cosmetic rare-find banner */}
            <div className="flex items-center gap-2 rounded-xl border border-brand/25 bg-brand/5 px-4 py-3 text-sm text-ink">
              <span aria-hidden>💎</span>
              <span>
                <span className="font-semibold">Rare find!</span> This place is usually booked.
              </span>
            </div>

            <div className="rounded-2xl border border-line p-6 shadow-card">
              {/* Listing mini-card */}
              {listing && (
                <div className="flex gap-4 border-b border-line-soft pb-5">
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                    {listing.coverPhoto && (
                      <Image src={listing.coverPhoto} alt={listing.title} fill sizes="96px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    {favourite && (
                      <span className="mb-1 inline-block rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-ink">
                        Guest favourite
                      </span>
                    )}
                    <p className="truncate text-sm font-medium text-ink">{listing.title}</p>
                    <p className="truncate text-sm text-muted">
                      {listing.city}, {listing.country}
                    </p>
                    {listing.ratingAvg != null && (
                      <p className="mt-1 text-sm text-ink">
                        <span aria-hidden>★</span> {formatRating(listing.ratingAvg)} ({listing.ratingCount})
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Free cancellation */}
              <div className="border-b border-line-soft py-5">
                <p className="font-semibold text-ink">Free cancellation</p>
                <p className="mt-1 text-sm text-muted">
                  Cancel before {checkIn ? fmtDate(subDays(parseISO(checkIn), 1).toISOString()) : "—"} for a full
                  refund. <span className="underline">Full policy</span>
                </p>
              </div>

              {/* Dates + Guests, each with a Change button */}
              <div className="border-b border-line-soft py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-ink">Dates</p>
                    <p className="text-sm text-muted">
                      {checkIn && checkOut ? `${fmtDate(checkIn)} – ${fmtDate(checkOut)}` : "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/rooms/${id}`)}
                    className="text-sm font-semibold text-ink underline"
                  >
                    Change
                  </button>
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-ink">Guests</p>
                    <p className="text-sm text-muted">{guestLabel}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/rooms/${id}`)}
                    className="text-sm font-semibold text-ink underline"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Price details from /quote (never computed client-side) */}
              <div className="pt-5">
                <h3 className="mb-3 font-semibold text-ink">Price details</h3>
                {quote ? (
                  <>
                    <PriceLines quote={quote} />
                    <button
                      onClick={() => setShowBreakdown(true)}
                      className="mt-4 text-sm font-medium text-ink underline"
                    >
                      Price breakdown
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-muted">Loading price…</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price-breakdown modal — same line items as the card */}
      <Modal open={showBreakdown} onClose={() => setShowBreakdown(false)} title="Price breakdown">
        {quote && <PriceLines quote={quote} />}
      </Modal>
    </div>
  );
}

// Shared price line items (card + modal). Displays exactly what /quote returned.
function PriceLines({ quote }: { quote: Quote }) {
  return (
    <div className="space-y-3 text-sm">
      <Row
        label={`${formatMoney(quote.nightlyRate)} x ${quote.nights} ${quote.nights === 1 ? "night" : "nights"}`}
        value={formatMoney(quote.subtotal)}
      />
      <Row label="Cleaning fee" value={formatMoney(quote.cleaningFee)} />
      <Row label="Service fee" value={formatMoney(quote.serviceFee)} />
      <Row label="Taxes" value={formatMoney(quote.taxes)} />
      <div className="border-t border-line pt-3">
        <Row label="Total (INR)" value={formatMoney(quote.total)} bold />
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
