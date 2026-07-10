"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

// Reviews are gated server-side to guests with a completed stay; this form
// simply surfaces that outcome. Hidden entirely for logged-out visitors.
export default function ReviewForm({ listingId }: { listingId: number }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);

  if (!getToken()) return null;

  const submit = async () => {
    try {
      await api.post(`/listings/${listingId}/reviews`, { rating, comment });
      toast.success("Review posted");
      setComment("");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message); // 403 if no completed stay
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 rounded-lg border border-line px-4 py-2 text-sm hover:shadow-pill"
      >
        Write a review
      </button>
    );
  }

  return (
    <div className="mt-4 space-y-2 rounded-card border border-line p-4">
      <label className="block text-sm text-muted">
        Rating
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="ml-2 rounded border border-line p-1"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </select>
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience…"
        rows={3}
        className="w-full rounded-lg border border-line p-2 text-sm"
      />
      <button
        onClick={submit}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
      >
        Post review
      </button>
    </div>
  );
}
