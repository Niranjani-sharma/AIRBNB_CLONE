// Lightweight static map (OpenStreetMap embed — no API key required).
// Coordinates are modeled on the listing; a live interactive map with pins is a
// documented bonus/future item.
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
  const d = 0.03;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold">Where you&apos;ll be</h2>
      <iframe
        src={src}
        title={`Map showing ${label}`}
        loading="lazy"
        className="h-72 w-full rounded-card border border-border"
      />
      <p className="mt-2 text-xs text-foggy">{label} · approximate location</p>
    </section>
  );
}
