"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import type { Booking } from "@/lib/types";

export default function TripsPage() {
  const toast = useToast();
  const [trips, setTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/bookings/me")
      .then((r) => setTrips(r.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const cancel = async (id: number) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      setTrips((t) => t.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-semibold">My trips</h1>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-card" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          title="No trips booked… yet"
          body="Time to dust off your bags and start planning your next adventure."
          ctaLabel="Start searching"
          ctaHref="/"
        />
      ) : (
        <div className="space-y-4">
          {trips.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-card border border-line p-4"
            >
              <div>
                <p className="font-medium">{b.listing?.title ?? "Listing"}</p>
                <p className="text-sm text-muted">
                  {new Date(b.checkIn).toLocaleDateString()} →{" "}
                  {new Date(b.checkOut).toLocaleDateString()} ·{" "}
                  <span className="capitalize">{b.status}</span>
                </p>
                <p className="text-sm">{formatMoney(b.totalPrice)}</p>
              </div>
              {b.status !== "cancelled" && b.status !== "completed" && (
                <button
                  onClick={() => cancel(b.id)}
                  className="rounded-lg border border-line px-3 py-2 text-sm hover:bg-bg-soft"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
