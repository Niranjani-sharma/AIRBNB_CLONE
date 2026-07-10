"use client";
import dynamic from "next/dynamic";

// Interactive map (Leaflet + OpenStreetMap tiles, no API key). Loaded client-side
// only since Leaflet needs the DOM.
const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-bg-soft motion-reduce:animate-none" />
  ),
});

export default function LocationMap({
  lat,
  lng,
  label,
}: {
  lat: number | null;
  lng: number | null;
  label: string;
}) {
  if (lat == null || lng == null) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold">Where you&apos;ll be</h2>
      <div className="h-72 w-full overflow-hidden rounded-2xl border border-line">
        <InteractiveMap points={[{ id: 0, lat, lng }]} center={[lat, lng]} zoom={13} />
      </div>
      <p className="mt-2 text-xs text-muted">{label} · approximate location</p>
    </section>
  );
}
