"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  differenceInCalendarDays,
  format,
  isBefore,
  parseISO,
  startOfToday,
} from "date-fns";
import { DoorOpen, DoorClosed, ChevronRight } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";
import type { Booking } from "@/lib/types";

// Honest, data-only badge. No payment/pending states — bookings are created
// confirmed. Time-until-checkin is derived from checkIn/checkOut vs today.
function badgeFor(b: Booking): { text: string; muted: boolean } {
  if (b.status === "cancelled") return { text: "Cancelled", muted: true };
  if (b.status === "completed") return { text: "Completed", muted: true };
  const today = startOfToday();
  const ci = parseISO(b.checkIn);
  const co = parseISO(b.checkOut);
  if (!isBefore(today, co)) return { text: "Completed", muted: true }; // past confirmed
  if (!isBefore(today, ci)) return { text: "In progress", muted: false }; // staying now
  const days = differenceInCalendarDays(ci, today);
  if (days < 7) return { text: `In ${days} ${days === 1 ? "day" : "days"}`, muted: false };
  const weeks = Math.round(days / 7);
  return { text: `In ${weeks} ${weeks === 1 ? "week" : "weeks"}`, muted: false };
}

const dateRange = (b: Booking) =>
  `${format(parseISO(b.checkIn), "d MMM")} – ${format(parseISO(b.checkOut), "d MMM yyyy")}`;

// Static, generic check-in/out timeline — UI copy, not per-listing data.
function StayTimeline({ b }: { b: Booking }) {
  const ci = parseISO(b.checkIn);
  const co = parseISO(b.checkOut);
  const rows: { date: Date; Icon: typeof DoorOpen; label: string }[] = [
    { date: ci, Icon: DoorOpen, label: "Check-in after 2:00 PM" },
    { date: co, Icon: DoorClosed, label: "Checkout before 11:00 AM" },
  ];
  return (
    <div className="mt-3 rounded-2xl border border-line-soft p-4 sm:p-5">
      <div className="relative">
        {/* vertical rail connecting the two date nodes */}
        <span className="pointer-events-none absolute left-[68px] top-8 bottom-8 w-px bg-line" aria-hidden />
        {rows.map(({ date, Icon, label }, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="w-14 shrink-0 text-center">
              <div className="text-base font-semibold text-ink">{format(date, "d")}</div>
              <div className="text-[11px] uppercase tracking-wide text-muted">{format(date, "EEE")}</div>
            </div>
            <div className="flex w-6 shrink-0 justify-center">
              <span className="z-10 h-3 w-3 rounded-full border-2 border-ink bg-bg" aria-hidden />
            </div>
            <Icon size={20} className="ml-1 shrink-0 text-ink" aria-hidden />
            <span className="flex-1 text-sm text-ink">{label}</span>
            <ChevronRight size={16} className="shrink-0 text-muted" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TripsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api
      .get("/bookings/me")
      .then((r) => setTrips(r.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const cancel = async () => {
    if (confirmId == null) return;
    const id = confirmId;
    try {
      setCancelling(true);
      await api.patch(`/bookings/${id}/cancel`);
      toast.success("Trip cancelled");
      setTrips((t) => t.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
      setConfirmId(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCancelling(false);
    }
  };

  // Group by listing city; sort each city's trips by check-in.
  const cities = useMemo(() => {
    const m = new Map<string, Booking[]>();
    for (const b of trips) {
      const city = b.listing?.city ?? "Your trips";
      (m.get(city) ?? m.set(city, []).get(city)!).push(b);
    }
    return [...m.entries()].map(
      ([city, list]) =>
        [city, [...list].sort((a, b) => a.checkIn.localeCompare(b.checkIn))] as const
    );
  }, [trips]);

  const initial = (user?.name?.charAt(0) ?? "Y").toUpperCase();

  return (
    <div className="py-8">
      <h1 className="mb-8 text-[32px] font-bold leading-tight text-ink">Trips</h1>

      {loading ? (
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          title="No trips yet"
          body="Time to dust off your bags and start planning your next adventure."
          ctaLabel="Start searching"
          ctaHref="/"
        />
      ) : (
        <div className="space-y-12">
          {cities.map(([city, list]) => (
            <section key={city}>
              <h2 className="mb-4 text-[22px] font-bold text-ink">{city}</h2>
              <div className="space-y-8">
                {list.map((b) => {
                  const badge = badgeFor(b);
                  const canCancel = b.status === "confirmed";
                  return (
                    <div key={b.id}>
                      {/* Trip card */}
                      <div className="overflow-hidden rounded-2xl border border-line-soft">
                        <div className="flex flex-col sm:flex-row">
                          {/* Left: cover image + time-until badge */}
                          <div className="relative min-h-[220px] sm:w-[40%]">
                            {b.listing?.coverPhoto ? (
                              <Image
                                src={b.listing.coverPhoto}
                                alt={b.listing.title}
                                fill
                                sizes="(max-width: 640px) 100vw, 40vw"
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-bg-soft" />
                            )}
                            <span
                              className={`absolute left-3 top-3 rounded-full bg-bg px-3 py-1 text-xs font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.18)] ${
                                badge.muted ? "text-muted" : "text-ink"
                              }`}
                            >
                              {badge.text}
                            </span>
                          </div>

                          {/* Right: title, dates, bottom action row */}
                          <div className="flex flex-1 flex-col p-6">
                            <h3 className="text-2xl font-bold text-ink">
                              {b.listing?.title ?? "Your stay"}
                            </h3>
                            <p className="mt-1 text-muted">{dateRange(b)}</p>

                            <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-soft pt-4">
                              <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand">
                                  {initial}
                                </span>
                                {canCancel && (
                                  <button
                                    onClick={() => setConfirmId(b.id)}
                                    className="text-sm font-medium text-ink underline underline-offset-2 hover:text-muted"
                                  >
                                    Cancel reservation
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toast.info("Coming soon")}
                                  className="hidden rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-bg-soft sm:block"
                                >
                                  Invite guests
                                </button>
                                <Link
                                  href={`/rooms/${b.listingId}`}
                                  className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-bg-soft"
                                >
                                  View listing
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Static check-in/out timeline */}
                      <StayTimeline b={b} />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Confirm-before-cancel dialog */}
      <Modal open={confirmId != null} onClose={() => setConfirmId(null)} title="Cancel this trip?">
        <p className="text-sm text-muted">This will cancel your reservation.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setConfirmId(null)}
            disabled={cancelling}
            className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-bg-soft disabled:opacity-50"
          >
            Keep trip
          </button>
          <button
            onClick={cancel}
            disabled={cancelling}
            className="rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
          >
            {cancelling ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
