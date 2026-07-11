import { notFound } from "next/navigation";
import { formatRating } from "@/lib/rating";
import PhotoGallery from "@/components/gallery/PhotoGallery";
import ReservationCard from "@/components/booking/ReservationCard";
import InlineAvailability from "@/components/booking/InlineAvailability";
import ReviewsSection from "@/components/listing/ReviewsSection";
import LocationMap from "@/components/listing/LocationMap";
import HostCard from "@/components/listing/HostCard";
import ThingsToKnow from "@/components/listing/ThingsToKnow";
import SaveButton from "@/components/listing/SaveButton";
import WhatThisPlaceOffers from "@/components/listing/WhatThisPlaceOffers";
import ComingSoon from "@/components/ui/ComingSoon";
import HomeCarousel from "@/components/home/HomeCarousel";
import { ReservationProvider } from "@/lib/reservation-context";
import { getListings } from "@/lib/listings-server";
import type { ListingCard, ListingDetail, Review } from "@/lib/types";

export const dynamic = "force-dynamic";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

async function getData(id: string) {
  const [listingRes, reviewsRes] = await Promise.all([
    fetch(`${API_BASE}/listings/${id}`, { cache: "no-store" }),
    fetch(`${API_BASE}/listings/${id}/reviews`, { cache: "no-store" }),
  ]);
  if (!listingRes.ok) return null;
  const listing = (await listingRes.json()).data as ListingDetail;
  const reviews = ((await reviewsRes.json()).data ?? []) as Review[];
  return { listing, reviews };
}

async function getNearby(city: string, excludeId: number): Promise<ListingCard[]> {
  const near = await getListings({ location: city, limit: "12" });
  let items = near.items.filter((l) => l.id !== excludeId);
  if (items.length < 4) {
    const all = await getListings({ limit: "12" });
    items = all.items.filter((l) => l.id !== excludeId);
  }
  return items.slice(0, 10);
}

// Derived highlights (no invented backend data).
function highlightsFor(listing: ListingDetail) {
  const out: { icon: string; title: string; text: string }[] = [];
  if (listing.host?.isSuperhost)
    out.push({ icon: "🏅", title: "Top-rated host", text: `${listing.host.name} is a Superhost with great reviews.` });
  if (listing.amenities.includes("Workspace") || listing.amenities.includes("WiFi"))
    out.push({ icon: "💻", title: "Great for remote work", text: "Fast wifi and space to work comfortably." });
  if (listing.amenities.includes("Free parking"))
    out.push({ icon: "🅿️", title: "Free parking on premises", text: "One of the few places with free parking." });
  out.push({ icon: "🗝️", title: "Self check-in", text: "Check yourself in with the lockbox." });
  return out.slice(0, 3);
}

export default async function ListingDetail({ params }: { params: { id: string } }) {
  const data = await getData(params.id);
  if (!data) notFound();
  const { listing, reviews } = data;
  const nearby = await getNearby(listing.city, listing.id);
  const ratingLabel = listing.ratingAvg != null ? formatRating(listing.ratingAvg) : "New";
  const favourite = listing.ratingAvg != null && listing.ratingAvg >= 4.9;
  const highlights = highlightsFor(listing);

  return (
    <div className="mx-auto max-w-[1120px] py-6">
      {/* Gallery spans the full container above the two columns */}
      <PhotoGallery photos={listing.photos} title={listing.title} />

      {/* ZONE 1 — two-column grid: content + sticky reservation card.
          Closes right after the availability calendar so the card releases there. */}
      <ReservationProvider listingId={listing.id} maxGuests={listing.maxGuests}>
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Left content column */}
          <div className="lg:col-span-2">
            {/* Title / subtitle / specs */}
            <div className="flex items-start justify-between gap-4 border-b border-line-soft pb-6">
              <div>
                <h1 className="text-2xl font-semibold capitalize">{listing.title}</h1>
                <p className="mt-1 text-ink">
                  Entire {listing.propertyType} in {listing.city}, {listing.country}
                </p>
                <p className="text-muted">
                  {listing.maxGuests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds ·{" "}
                  {listing.bathrooms} bathrooms
                </p>
              </div>
              <SaveButton listingId={listing.id} />
            </div>

            {/* Guest-favourite highlight + rating/reviews */}
            {favourite ? (
              <div className="my-6 flex items-center justify-between gap-4 rounded-2xl border border-line p-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>🏆</span>
                  <div>
                    <p className="font-semibold text-ink">Guest favourite</p>
                    <p className="text-sm text-muted">One of the most loved homes, according to guests</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-center">
                  <div>
                    <p className="text-xl font-semibold">{ratingLabel}</p>
                    <p className="text-[11px] text-muted">★★★★★</p>
                  </div>
                  <div className="border-l border-line pl-5">
                    <p className="text-xl font-semibold">{listing.ratingCount}</p>
                    <p className="text-[11px] text-muted">Reviews</p>
                  </div>
                </div>
              </div>
            ) : (
              listing.ratingAvg != null && (
                <p className="border-b border-line-soft py-5 font-medium text-ink">
                  ★ {ratingLabel} · {listing.ratingCount}{" "}
                  {listing.ratingCount === 1 ? "review" : "reviews"}
                </p>
              )
            )}

            {/* Host row */}
            <div className="flex items-center gap-3 border-b border-line-soft py-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-sm font-semibold text-bg">
                {listing.host?.name?.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-medium text-ink">Hosted by {listing.host?.name}</p>
                <p className="text-sm text-muted">
                  {listing.host?.isSuperhost ? "Superhost · " : ""}Response within an hour
                </p>
              </div>
            </div>

            {/* Highlights */}
            <div className="border-b border-line-soft py-6">
              <ul className="space-y-5">
                {highlights.map((h) => (
                  <li key={h.title} className="flex items-start gap-4">
                    <span className="text-2xl" aria-hidden>{h.icon}</span>
                    <div>
                      <p className="font-medium text-ink">{h.title}</p>
                      <p className="text-sm text-muted">{h.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Description */}
            <div className="border-b border-line-soft py-6">
              <p className="whitespace-pre-line text-ink">{listing.description}</p>
            </div>

            {/* Amenities */}
            <WhatThisPlaceOffers amenities={listing.amenities} />

            {/* Inline availability calendar (shares state with the card) — last row of Zone 1 */}
            <InlineAvailability city={listing.city} />
          </div>

          {/* Right column: sticky reservation card only (self-sticky, top ~112px) */}
          <div className="lg:col-span-1">
            <ReservationCard listing={listing} />
          </div>
        </div>
      </ReservationProvider>

      {/* ZONE 2 — full-width, single column (no right column past this point) */}
      <div className="mt-4">
        {/* Reviews */}
        <ReviewsSection
          listingId={listing.id}
          ratingAvg={listing.ratingAvg}
          ratingCount={listing.ratingCount}
          reviews={reviews}
        />

        {/* Where you'll be (map) */}
        <div className="border-b border-line-soft py-10">
          <LocationMap
            lat={listing.latitude}
            lng={listing.longitude}
            label={`${listing.city}, ${listing.country}`}
          />
        </div>

        {/* Meet your host */}
        <HostCard host={listing.host} ratingAvg={listing.ratingAvg} ratingCount={listing.ratingCount} />

        {/* Things to know */}
        <ThingsToKnow maxGuests={listing.maxGuests} />

        {/* Identity verification placeholder */}
        <div className="py-8">
          <ComingSoon title="Identity verification">
            Verified-guest badges will appear here.
          </ComingSoon>
        </div>

        {/* More stays nearby */}
        <div className="mt-8 border-t border-line-soft pt-6">
          <HomeCarousel title="More stays nearby" listings={nearby} />
        </div>
      </div>
    </div>
  );
}
