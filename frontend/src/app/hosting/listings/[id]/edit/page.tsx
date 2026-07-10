"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import HostListingForm from "@/components/HostListingForm";
import type { ListingDetail } from "@/lib/types";

export default function EditListing({ params }: { params: { id: string } }) {
  const [initial, setInitial] = useState<ListingDetail | null>(null);
  useEffect(() => {
    api.get(`/listings/${params.id}`).then((r) => setInitial(r.data));
  }, [params.id]);
  if (!initial) return <p className="py-8">Loading…</p>;
  return <HostListingForm initial={initial} listingId={params.id} />;
}
