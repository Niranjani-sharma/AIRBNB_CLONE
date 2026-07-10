// "What this place offers" — amenities rendered with icons (Airbnb pattern).
// Icons are a lightweight emoji map; unknown amenities fall back to a check.
const ICONS: Record<string, string> = {
  WiFi: "📶",
  Kitchen: "🍳",
  Washer: "🧺",
  "Air conditioning": "❄️",
  Heating: "🔥",
  Pool: "🏊",
  "Free parking": "🅿️",
  "Hot tub": "🛁",
  TV: "📺",
  Workspace: "💻",
  Fireplace: "🪵",
  Gym: "🏋️",
  "Beach access": "🏖️",
  "Pets allowed": "🐾",
  "EV charger": "🔌",
};

export default function WhatThisPlaceOffers({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;
  return (
    <section className="border-b border-line py-8">
      <h2 className="mb-5 text-xl font-semibold">What this place offers</h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {amenities.map((a) => (
          <li key={a} className="flex items-center gap-4 text-ink">
            <span className="text-xl" aria-hidden>
              {ICONS[a] ?? "✔️"}
            </span>
            <span>{a}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
