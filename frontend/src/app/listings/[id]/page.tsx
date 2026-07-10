import PhotoGallery from "@/components/gallery/PhotoGallery";
import BookingCard from "@/components/booking/BookingCard";
import ReviewForm from "@/components/booking/ReviewForm";
import LocationMap from "@/components/listing/LocationMap";
import HostCard from "@/components/listing/HostCard";
import ThingsToKnow from "@/components/listing/ThingsToKnow";
import SaveButton from "@/components/listing/SaveButton";
import WhereYouSleep from "@/components/listing/WhereYouSleep";
import WhatThisPlaceOffers from "@/components/listing/WhatThisPlaceOffers";
import ComingSoon from "@/components/ui/ComingSoon";
import type { ListingDetailDTO, ReviewDTO } from "@/lib/types";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function getData(id: string) {
  const [listingRes, reviewsRes] = await Promise.all([
    fetch(`${API_BASE}/listings/${id}`, { cache: "no-store" }),
    fetch(`${API_BASE}/listings/${id}/reviews`, { cache: "no-store" }),
  ]);
  if (!listingRes.ok) return null;
  // API responses are wrapped as { data, message, success }.
  const listing = (await listingRes.json()).data as ListingDetailDTO;
  const reviews = ((await reviewsRes.json()).data ?? []) as ReviewDTO[];
  return { listing, reviews };
}

// A few derived "highlights" so the detail page mirrors Airbnb's callouts,
// without inventing data the backend doesn't have.
function highlightsFor(listing: ListingDetailDTO) {
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
  const ratingLabel = listing.ratingAvg != null ? listing.ratingAvg.toFixed(2) : "New";
  const favourite = listing.ratingAvg != null && listing.ratingAvg >= 4.8;
  const highlights = highlightsFor(listing);

  return (
    <div className="py-6">
      {/* Title + Share/Save */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <SaveButton listingId={listing.id} />
      </div>
      <p className="mb-4 text-sm text-foggy">
        {listing.ratingAvg != null && (
          <span className="font-medium text-hof">
            ★ {ratingLabel} · {listing.ratingCount} reviews ·{" "}
          </span>
        )}
        {listing.city}, {listing.country}
        {listing.host?.isSuperhost ? " · Superhost" : ""}
      </p>

      <PhotoGallery photos={listing.photos} title={listing.title} />

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2">
          <div className="border-b border-border pb-6">
            <h2 className="text-xl font-semibold capitalize">
              Entire {listing.propertyType} in {listing.city}, {listing.country}
            </h2>
            <p className="text-foggy">
              {listing.maxGuests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds ·{" "}
              {listing.bathrooms} bathrooms
            </p>
          </div>

          {/* Guest favourite highlight box */}
          {favourite && (
            <div className="my-6 flex items-center justify-between gap-4 rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden>🏆</span>
                <div>
                  <p className="font-semibold text-hof">Guest favourite</p>
                  <p className="text-sm text-foggy">One of the most loved homes, according to guests</p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-center">
                <div>
                  <p className="text-xl font-semibold">{ratingLabel}</p>
                  <p className="text-[11px] text-foggy">★★★★★</p>
                </div>
                <div className="border-l border-border pl-5">
                  <p className="text-xl font-semibold">{listing.ratingCount}</p>
                  <p className="text-[11px] text-foggy">Reviews</p>
                </div>
              </div>
            </div>
          )}

          {/* Host preview */}
          <div className="flex items-center gap-3 border-b border-border py-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-hof text-sm font-semibold text-white">
              {listing.host?.name?.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-medium text-hof">Hosted by {listing.host?.name}</p>
              <p className="text-sm text-foggy">
                {listing.host?.isSuperhost ? "Superhost · " : ""}Response within an hour
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="border-b border-border py-6">
            <ul className="space-y-5">
              {highlights.map((h) => (
                <li key={h.title} className="flex items-start gap-4">
                  <span className="text-2xl" aria-hidden>{h.icon}</span>
                  <div>
                    <p className="font-medium text-hof">{h.title}</p>
                    <p className="text-sm text-foggy">{h.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Description */}
          <div className="border-b border-border py-6">
            <p className="whitespace-pre-line text-hof">{listing.description}</p>
          </div>

          {/* Where you'll sleep */}
          <WhereYouSleep bedrooms={listing.bedrooms} beds={listing.beds} photos={listing.photos} />

          {/* Amenities with icons */}
          <WhatThisPlaceOffers amenities={listing.amenities} />

          {/* Map */}
          <div className="border-b border-border py-8">
            <LocationMap
              lat={listing.latitude}
              lng={listing.longitude}
              label={`${listing.city}, ${listing.country}`}
            />
          </div>

          {/* Reviews */}
          <section className="border-b border-border py-8">
            <h2 className="mb-6 text-xl font-semibold">
              {listing.ratingAvg != null ? `★ ${ratingLabel} · ${listing.ratingCount} reviews` : "Reviews"}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-foggy">No reviews yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {reviews.map((r) => (
                  <div key={r.id}>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-hof">
                        {r.authorName.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-hof">{r.authorName}</p>
                        <p className="text-xs text-foggy">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="mb-1 text-sm text-hof">{"★".repeat(r.rating)}</p>
                    <p className="text-sm text-foggy">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
            <ReviewForm listingId={listing.id} />
          </section>

          {/* Meet your host */}
          <HostCard host={listing.host} ratingAvg={listing.ratingAvg} ratingCount={listing.ratingCount} />

          {/* Things to know */}
          <ThingsToKnow maxGuests={listing.maxGuests} />

          {/* Identity verification is mocked per the brief */}
          <div className="border-t border-border py-8">
            <ComingSoon title="Identity verification">
              Verified-guest badges will appear here.
            </ComingSoon>
          </div>
        </div>

        {/* Right column: reserve card */}
        <div className="lg:col-span-1">
          <BookingCard listing={listing} />
        </div>
      </div>
    </div>
  );
}
