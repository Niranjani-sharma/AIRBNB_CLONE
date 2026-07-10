"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { BookingDTO } from "@/lib/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<BookingDTO[]>([]);

  useEffect(() => {
    api
      .get("/bookings/me")
      .then((r) => setTrips(r.data))
      .catch((e) => toast.error(e.message));
  }, []);

  const cancel = async (id: number) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      setTrips((t) =>
        t.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-semibold">My trips</h1>
      {trips.length === 0 && <p className="text-foggy">No trips booked yet.</p>}
      <div className="space-y-4">
        {trips.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between rounded-card border border-border p-4"
          >
            <div>
              <p className="font-medium">{b.listing?.title ?? "Listing"}</p>
              <p className="text-sm text-foggy">
                {new Date(b.checkIn).toLocaleDateString()} →{" "}
                {new Date(b.checkOut).toLocaleDateString()} · {b.status}
              </p>
              <p className="text-sm">{formatMoney(b.totalPrice)}</p>
            </div>
            {b.status !== "cancelled" && b.status !== "completed" && (
              <button
                onClick={() => cancel(b.id)}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
