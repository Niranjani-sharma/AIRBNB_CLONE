"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import type { ListingDetail } from "@/lib/types";

// Prices are entered in dollars in the UI but stored as cents. This form maps
// between the two so the DB never sees a float. Payload is camelCase (the API
// accepts camelCase via Pydantic aliases) with flat city/country.
export default function HostListingForm({
  initial,
  listingId,
}: {
  initial?: ListingDetail;
  listingId?: string;
}) {
  const router = useRouter();
  const [f, setF] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    propertyType: initial?.propertyType ?? "apartment",
    city: initial?.city ?? "",
    country: initial?.country ?? "",
    priceDollars: initial ? initial.pricePerNight / 100 : 100,
    cleaningDollars: initial ? initial.cleaningFee / 100 : 30,
    maxGuests: initial?.maxGuests ?? 2,
    amenities: (initial?.amenities ?? []).join(", "),
    photos: (initial?.photos ?? []).map((p) => p.url).join("\n"),
  });

  const save = async () => {
    const payload = {
      title: f.title,
      description: f.description,
      propertyType: f.propertyType,
      city: f.city,
      country: f.country,
      pricePerNight: Math.round(Number(f.priceDollars) * 100),
      cleaningFee: Math.round(Number(f.cleaningDollars) * 100),
      serviceFeePct: 0.14,
      maxGuests: Number(f.maxGuests),
      amenities: f.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      photos: f.photos
        .split("\n")
        .map((url, i) => ({ url: url.trim(), sortOrder: i, isCover: i === 0 }))
        .filter((p) => p.url),
    };
    try {
      if (listingId) await api.patch(`/listings/${listingId}`, payload);
      else await api.post("/listings", payload);
      toast.success("Listing saved");
      router.push("/hosting/listings");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const set = (k: string, v: string | number) => setF({ ...f, [k]: v });

  return (
    <div className="mx-auto max-w-xl space-y-3 py-8">
      <h1 className="text-2xl font-semibold">
        {listingId ? "Edit listing" : "New listing"}
      </h1>
      <input
        className="w-full rounded-lg border border-line p-3"
        placeholder="Title"
        value={f.title}
        onChange={(e) => set("title", e.target.value)}
      />
      <textarea
        className="w-full rounded-lg border border-line p-3"
        placeholder="Description"
        rows={4}
        value={f.description}
        onChange={(e) => set("description", e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          className="rounded-lg border border-line p-3"
          placeholder="City"
          value={f.city}
          onChange={(e) => set("city", e.target.value)}
        />
        <input
          className="rounded-lg border border-line p-3"
          placeholder="Country"
          value={f.country}
          onChange={(e) => set("country", e.target.value)}
        />
        <input
          className="rounded-lg border border-line p-3"
          placeholder="Property type (e.g. apartment, cabin, villa)"
          value={f.propertyType}
          onChange={(e) => set("propertyType", e.target.value)}
        />
        <input
          className="rounded-lg border border-line p-3"
          type="number"
          placeholder="Max guests"
          value={f.maxGuests}
          onChange={(e) => set("maxGuests", e.target.value)}
        />
        <input
          className="rounded-lg border border-line p-3"
          type="number"
          placeholder="Price / night ($)"
          value={f.priceDollars}
          onChange={(e) => set("priceDollars", e.target.value)}
        />
        <input
          className="rounded-lg border border-line p-3"
          type="number"
          placeholder="Cleaning fee ($)"
          value={f.cleaningDollars}
          onChange={(e) => set("cleaningDollars", e.target.value)}
        />
      </div>
      <input
        className="w-full rounded-lg border border-line p-3"
        placeholder="Amenities (comma separated)"
        value={f.amenities}
        onChange={(e) => set("amenities", e.target.value)}
      />
      <textarea
        className="w-full rounded-lg border border-line p-3"
        placeholder="Photo URLs (one per line, first = cover)"
        rows={3}
        value={f.photos}
        onChange={(e) => set("photos", e.target.value)}
      />
      <button
        onClick={save}
        className="w-full rounded-lg bg-brand p-3 font-medium text-white"
      >
        Save listing
      </button>
    </div>
  );
}
