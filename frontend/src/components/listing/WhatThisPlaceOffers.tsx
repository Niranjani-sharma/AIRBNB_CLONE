"use client";
import { useState } from "react";
import {
  Wifi,
  UtensilsCrossed,
  AirVent,
  Tv,
  Laptop,
  SquareParking,
  Waves,
  PawPrint,
  Wind,
  Flame,
  Dumbbell,
  Bath,
  Palmtree,
  PlugZap,
  WashingMachine,
  Check,
  type LucideIcon,
} from "lucide-react";
import Modal from "@/components/ui/Modal";

// Monochrome line icon per amenity (Airbnb style). Unknown amenities fall back to
// a check — only amenities the listing actually has are rendered.
const ICONS: Record<string, LucideIcon> = {
  WiFi: Wifi,
  Wifi: Wifi,
  Kitchen: UtensilsCrossed,
  "Air conditioning": AirVent,
  TV: Tv,
  Workspace: Laptop,
  "Dedicated workspace": Laptop,
  "Free parking": SquareParking,
  Pool: Waves,
  "Hot tub": Bath,
  "Pets allowed": PawPrint,
  Hairdryer: Wind,
  Heating: Flame,
  Fireplace: Flame,
  Gym: Dumbbell,
  "Beach access": Palmtree,
  "EV charger": PlugZap,
  Washer: WashingMachine,
};

function AmenityRow({ name }: { name: string }) {
  const Icon = ICONS[name] ?? Check;
  return (
    <li className="flex items-center gap-4 border-b border-line-soft py-3 text-ink">
      <Icon size={22} strokeWidth={1.5} className="shrink-0 text-ink" aria-hidden />
      <span>{name}</span>
    </li>
  );
}

export default function WhatThisPlaceOffers({ amenities }: { amenities: string[] }) {
  const [open, setOpen] = useState(false);
  if (amenities.length === 0) return null;
  const shown = amenities.slice(0, 10);

  return (
    <section className="border-b border-line-soft py-10">
      <h2 className="mb-5 text-2xl font-semibold">What this place offers</h2>
      <ul className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
        {shown.map((a) => (
          <AmenityRow key={a} name={a} />
        ))}
      </ul>

      {amenities.length > 10 && (
        <button
          onClick={() => setOpen(true)}
          className="mt-6 rounded-lg border border-line px-5 py-3 text-sm font-semibold hover:bg-bg-soft"
        >
          Show all {amenities.length} amenities
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="What this place offers">
        <h3 className="mb-4 text-xl font-semibold">What this place offers</h3>
        <ul>
          {amenities.map((a) => (
            <AmenityRow key={a} name={a} />
          ))}
        </ul>
      </Modal>
    </section>
  );
}
