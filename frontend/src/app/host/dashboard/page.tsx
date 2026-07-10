"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { BookingDTO, ListingCardDTO } from "@/lib/types";

export default function HostDashboard() {
  const [listings, setListings] = useState<ListingCardDTO[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Record<number, BookingDTO[]>>({});

  useEffect(() => {
    api
      .get("/listings/mine")
      .then((r) => setListings(r.data))
      .catch((e) => toast.error(e.message));
  }, []);

  const toggleBookings = async (id: number) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    if (!bookings[id]) {
      try {
        const r = await api.get(`/listings/${id}/bookings`);
        setBookings((b) => ({ ...b, [id]: r.data }));
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this listing? Booking history is preserved.")) return;
    try {
      await api.delete(`/listings/${id}`);
      toast.success("Listing deleted");
      setListings((l) => l.filter((x) => x.id !== id));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your listings</h1>
        <Link href="/host/listings/new" className="rounded-lg bg-rausch px-4 py-2 text-white">
          Add listing
        </Link>
      </div>
      <div className="space-y-3">
        {listings.length === 0 && <p className="text-foggy">You have no listings yet.</p>}
        {listings.map((l) => (
          <div key={l.id} className="rounded-card border border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {l.coverPhoto && (
                    <Image src={l.coverPhoto} alt={l.title} fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{l.title}</p>
                  <p className="text-sm text-foggy">
                    {l.city} · {formatMoney(l.pricePerNight)}/night
                    {l.ratingAvg != null ? ` · ★ ${l.ratingAvg.toFixed(2)}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => toggleBookings(l.id)}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                >
                  {openId === l.id ? "Hide bookings" : "Bookings"}
                </button>
                <Link
                  href={`/host/listings/${l.id}/edit`}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => remove(l.id)}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-rausch"
                >
                  Delete
                </button>
              </div>
            </div>

            {openId === l.id && (
              <div className="mt-4 border-t border-border pt-3">
                {!bookings[l.id] ? (
                  <p className="text-sm text-foggy">Loading bookings…</p>
                ) : bookings[l.id].length === 0 ? (
                  <p className="text-sm text-foggy">No bookings on this listing yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-foggy">
                        <th className="pb-2 font-medium">Dates</th>
                        <th className="pb-2 font-medium">Guests</th>
                        <th className="pb-2 font-medium">Total</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings[l.id].map((b) => (
                        <tr key={b.id} className="border-t border-border">
                          <td className="py-2">
                            {new Date(b.checkIn).toLocaleDateString()} →{" "}
                            {new Date(b.checkOut).toLocaleDateString()}
                          </td>
                          <td className="py-2">{b.guestsCount}</td>
                          <td className="py-2">{formatMoney(b.totalPrice)}</td>
                          <td className="py-2 capitalize">{b.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
