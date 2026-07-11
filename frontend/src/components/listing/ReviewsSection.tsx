"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, BadgeCheck, Key, MessageCircle, MapPin, Tag, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatRating } from "@/lib/rating";
import Modal from "@/components/ui/Modal";
import ReviewForm from "@/components/booking/ReviewForm";
import type { Booking, Review } from "@/lib/types";

// Cosmetic: the backend stores one overall score, so every category renders it.
const CATEGORIES: { label: string; Icon: typeof Sparkles }[] = [
  { label: "Cleanliness", Icon: Sparkles },
  { label: "Accuracy", Icon: BadgeCheck },
  { label: "Check-in", Icon: Key },
  { label: "Communication", Icon: MessageCircle },
  { label: "Location", Icon: MapPin },
  { label: "Value", Icon: Tag },
];

// Cosmetic tag chips (Airbnb-style). The backend has no tag data, so counts are
// derived on the client by keyword-matching this listing's review comments.
const TAG_KEYWORDS: { label: string; keywords: string[] }[] = [
  { label: "View", keywords: ["view", "scenic", "balcony"] },
  { label: "Hospitality", keywords: ["host", "welcoming", "responsive", "friendly"] },
  { label: "Condition", keywords: ["clean", "well-maintained", "new", "spotless"] },
  { label: "Cleanliness", keywords: ["clean", "tidy", "spotless"] },
  { label: "Accuracy", keywords: ["as described", "as pictured", "accurate"] },
  { label: "Comfort", keywords: ["comfortable", "cozy", "comfy", "beds"] },
  { label: "Check-in", keywords: ["check-in", "checkin", "lockbox", "easy"] },
  { label: "Location", keywords: ["location", "central", "walkable", "close"] },
  { label: "Value", keywords: ["value", "worth", "price"] },
];

function TagChips({ reviews }: { reviews: Review[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  const tags = useMemo(() => {
    const texts = reviews.map((r) => r.comment.toLowerCase());
    return TAG_KEYWORDS.map(({ label, keywords }) => ({
      label,
      count: texts.filter((t) => keywords.some((k) => t.includes(k))).length,
    }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [reviews]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const check = () => setCanScroll(el.scrollWidth > el.clientWidth + 4);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [tags.length]);

  if (tags.length === 0) return null;

  return (
    <div className="relative mb-10">
      <div
        ref={scroller}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-1 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tags.map((t) => (
          <span
            key={t.label}
            className="flex shrink-0 items-center whitespace-nowrap rounded-full border border-line bg-bg px-4 py-2 text-sm text-ink"
          >
            {t.label} {t.count}
          </span>
        ))}
      </div>
      {canScroll && (
        <button
          type="button"
          onClick={() => scroller.current?.scrollBy({ left: 240, behavior: "smooth" })}
          aria-label="Show more tags"
          className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:bg-bg-soft"
        >
          <ChevronRight size={16} className="text-ink" />
        </button>
      )}
    </div>
  );
}

// A laurel branch drawn as SVG so it scales cleanly on either side of the score.
function Laurel({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 40 100"
      width="34"
      height="86"
      aria-hidden
      className={`text-ink ${flip ? "-scale-x-100" : ""}`}
      fill="currentColor"
    >
      <path d="M33 2c-9 4-15 12-17 22-1 7-1 15 1 24 1 8 4 16 9 24-6-7-11-16-14-25-3-9-4-18-2-27C12 12 21 4 33 2z" />
      <path d="M24 20c-6 0-11 3-13 8 4 1 9 0 12-3 2-2 1-5 1-5zM21 34c-6 1-10 5-11 10 4 0 8-2 10-6 2-2 1-4 1-4zM20 49c-5 2-8 6-8 11 4-1 7-4 8-8 1-2 0-3 0-3zM22 64c-4 3-6 8-5 13 3-2 6-6 6-10 0-2-1-3-1-3zM27 79c-3 4-4 9-2 13 3-3 4-7 3-11 0-1-1-2-1-2z" />
    </svg>
  );
}

function Avatar({ review }: { review: Review }) {
  if (review.authorAvatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={review.authorAvatar}
        alt={review.authorName}
        className="h-11 w-11 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-soft text-sm font-semibold text-ink">
      {review.authorName.charAt(0).toUpperCase()}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const when = (() => {
    try {
      return formatDistanceToNow(new Date(review.createdAt), { addSuffix: true });
    } catch {
      return "";
    }
  })();
  const long = review.comment.length > 200;
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <Avatar review={review} />
        <div>
          <p className="font-medium text-ink">{review.authorName}</p>
          <p className="text-xs text-muted">Stayed here</p>
        </div>
      </div>
      <p className="mb-1.5 text-sm text-ink">
        <span aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}</span>
        {when && <span className="text-muted"> · {when}</span>}
      </p>
      <p className={`text-sm text-ink ${expanded ? "" : "line-clamp-4"}`}>{review.comment}</p>
      {long && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-sm font-semibold text-ink underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

// Left-most "Overall rating" column: a 5→1 histogram of thin bars.
function OverallHistogram({ reviews }: { reviews: Review[] }) {
  const total = reviews.length || 1;
  return (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-medium text-ink">Overall rating</p>
      <div className="space-y-1">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.filter((r) => r.rating === star).length;
          const pct = (count / total) * 100;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-2 text-[11px] text-muted">{star}</span>
              <div className="h-1 flex-1 rounded-full bg-line-soft">
                <div className="h-1 rounded-full bg-ink" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReviewsSection({
  listingId,
  ratingAvg,
  ratingCount,
  reviews,
}: {
  listingId: number;
  ratingAvg: number | null;
  ratingCount: number;
  reviews: Review[];
}) {
  const [eligible, setEligible] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const favourite = ratingAvg != null && ratingAvg >= 4.9;
  const ratingLabel = ratingAvg != null ? formatRating(ratingAvg) : null;
  const reviewWord = ratingCount === 1 ? "review" : "reviews";

  // Gate the review form on a completed stay (the API 403s otherwise).
  useEffect(() => {
    if (!getToken()) return;
    api
      .get("/bookings/me")
      .then((r) =>
        setEligible(
          (r.data as Booking[]).some((b) => b.listingId === listingId && b.status === "completed")
        )
      )
      .catch(() => setEligible(false));
  }, [listingId]);

  return (
    <section className="border-b border-line-soft py-10">
      {/* 1. Top block */}
      {favourite ? (
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="flex items-end justify-center gap-1">
            <Laurel />
            <span className="text-[64px] font-semibold leading-none text-ink">{ratingLabel}</span>
            <Laurel flip />
          </div>
          <p className="mt-4 text-xl font-semibold text-ink">Guest favourite</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            This home is a guest favourite based on ratings, reviews and reliability
          </p>
          <button className="mt-2 text-sm text-muted underline underline-offset-2 hover:text-ink">
            How reviews work
          </button>
        </div>
      ) : (
        <h2 className="mb-8 text-2xl font-semibold text-ink">
          {ratingLabel != null ? (
            <>
              <span aria-hidden>★</span> {ratingLabel} · {ratingCount} {reviewWord}
            </>
          ) : (
            "Reviews"
          )}
        </h2>
      )}

      {/* 2. Rating summary row: overall histogram + six category columns.
          A responsive grid so all six fit the width — no horizontal scroll. */}
      {ratingLabel != null && reviews.length > 0 && (
        <div className="mb-10 border-b border-line-soft pb-8">
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
            <div className="col-span-2 sm:col-span-4 lg:col-span-1">
              <OverallHistogram reviews={reviews} />
            </div>
            {CATEGORIES.map(({ label, Icon }) => (
              <div key={label} className="flex flex-col items-start gap-1">
                <p className="text-xs font-medium text-ink">{label}</p>
                <span className="text-sm font-medium text-ink">{ratingLabel}</span>
                <Icon size={24} strokeWidth={1.5} className="mt-1 text-ink" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2b. Derived tag chips (cosmetic approximation of Airbnb's review tags) */}
      {reviews.length > 0 && <TagChips reviews={reviews} />}

      {/* 3. Review cards */}
      {reviews.length === 0 ? (
        <p className="text-muted">No reviews yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
            {reviews.slice(0, 6).map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>

          {reviews.length > 6 && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-8 rounded-lg border border-ink px-5 py-3 text-sm font-semibold text-ink transition hover:bg-bg-soft"
            >
              Show all {ratingCount} {reviewWord}
            </button>
          )}
        </>
      )}

      {/* Show-all modal */}
      <Modal
        open={showAll}
        onClose={() => setShowAll(false)}
        title={`${ratingCount} ${reviewWord}`}
        maxWidth="max-w-[760px]"
      >
        <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </Modal>

      {eligible && <ReviewForm listingId={listingId} />}
    </section>
  );
}
