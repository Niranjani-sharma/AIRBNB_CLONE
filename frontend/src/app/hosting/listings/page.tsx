"use client";
import { formatRating } from "@/lib/rating";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Home } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import type { Booking, ListingCard } from "@/lib/types";

export default function HostDashboard() {
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Record<number, Booking[]>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

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

  const confirmDelete = async () => {
    if (deleteId == null) return;
    const id = deleteId;
    try {
      setDeleting(true);
      await api.delete(`/listings/${id}`);
      toast.success("Listing deleted");
      setDeleteId(null);
      // Fade the row out, then drop it from the list.
      setRemovingId(id);
      setTimeout(() => {
        setListings((l) => l.filter((x) => x.id !== id));
        setRemovingId(null);
      }, 250);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Your listings</h1>
          {listings.length > 0 && (
            <p className="mt-1 text-sm text-muted">
              {listings.length} {listings.length === 1 ? "listing" : "listings"}
            </p>
          )}
        </div>
        <Link
          href="/hosting/listings/new"
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:brightness-95"
        >
          Add listing
        </Link>
      </div>

      <div className="space-y-3">
        {listings.length === 0 && (
          <EmptyState
            icon="🏠"
            title="You haven't listed a place yet"
            body="Share your space and start welcoming guests. It only takes a few minutes."
            ctaLabel="Create your first listing"
            ctaHref="/hosting/listings/new"
          />
        )}

        {listings.map((l) => (
          <div
            key={l.id}
            className={`rounded-2xl border border-line-soft p-4 transition-all duration-200 ${
              removingId === l.id ? "scale-[0.98] opacity-0" : "opacity-100 hover:border-line"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Clickable area → preview the room. Actions sit outside this link. */}
              <Link href={`/rooms/${l.id}`} className="group flex min-w-0 flex-1 items-center gap-4">
                <div className="relative h-[72px] w-24 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                  {l.coverPhoto ? (
                    <Image src={l.coverPhoto} alt={l.title} fill sizes="96px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-muted" aria-hidden>
                      <Home size={22} strokeWidth={1.5} />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink group-hover:underline">{l.title}</p>
                  <p className="truncate text-sm text-muted">
                    {l.city} · {formatMoney(l.pricePerNight)}/night
                    {l.ratingAvg != null ? ` · ★ ${formatRating(l.ratingAvg)}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Active</p>
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => toggleBookings(l.id)}
                  className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-bg-soft"
                >
                  {openId === l.id ? "Hide bookings" : "Bookings"}
                </button>
                <Link
                  href={`/hosting/listings/${l.id}/edit`}
                  className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-bg-soft"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteId(l.id)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#C13515] transition hover:bg-[#C13515]/10"
                >
                  Delete
                </button>
              </div>
            </div>

            {openId === l.id && (
              <div className="mt-4 border-t border-line pt-3">
                {!bookings[l.id] ? (
                  <p className="text-sm text-muted">Loading bookings…</p>
                ) : bookings[l.id].length === 0 ? (
                  <p className="text-sm text-muted">No bookings on this listing yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted">
                        <th className="pb-2 font-medium">Guest</th>
                        <th className="pb-2 font-medium">Dates</th>
                        <th className="pb-2 font-medium">Guests</th>
                        <th className="pb-2 font-medium">Total</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings[l.id].map((b) => (
                        <tr key={b.id} className="border-t border-line">
                          <td className="py-2 text-ink">{b.guestName ?? `Guest #${b.guestId}`}</td>
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

      {/* Delete confirmation dialog */}
      <Modal open={deleteId != null} onClose={() => setDeleteId(null)} title="Delete this listing?">
        <p className="text-sm text-muted">This can&apos;t be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setDeleteId(null)}
            disabled={deleting}
            className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-bg-soft disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
