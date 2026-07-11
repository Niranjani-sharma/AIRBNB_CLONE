"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2, Home, TreePine, Tent, Hotel, Warehouse, Sailboat, BedDouble,
  Castle, Container as ContainerIcon, Caravan, DoorOpen, Users,
  Wifi, UtensilsCrossed, Snowflake, Thermometer, Tv, Laptop, Car, Waves,
  Bath, WashingMachine, PawPrint, Dumbbell, Flame, Umbrella, Zap, Wind,
  Plus, Minus, X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { formatMoney } from "@/lib/money";
import CityAutocomplete from "@/components/host/CityAutocomplete";
import type { ListingDetail } from "@/lib/types";

// The five types the search filters use are kept present; the rest map to a
// free-text property_type (stored lowercased).
const PROPERTY_TYPES: { label: string; Icon: typeof Home }[] = [
  { label: "Apartment", Icon: Building2 },
  { label: "House", Icon: Home },
  { label: "Cabin", Icon: TreePine },
  { label: "Cottage", Icon: Tent },
  { label: "Villa", Icon: Hotel },
  { label: "Barn", Icon: Warehouse },
  { label: "Boat", Icon: Sailboat },
  { label: "Bed & breakfast", Icon: BedDouble },
  { label: "Castle", Icon: Castle },
  { label: "Container", Icon: ContainerIcon },
  { label: "Tiny home", Icon: Caravan },
];

const PLACE_TYPES: { key: string; title: string; subtitle: string; Icon: typeof Home }[] = [
  { key: "entire", title: "An entire place", subtitle: "Guests have the whole place to themselves.", Icon: Home },
  { key: "room", title: "A room", subtitle: "Guests have their own room in a home, plus access to shared spaces.", Icon: DoorOpen },
  { key: "shared", title: "A shared room", subtitle: "Guests sleep in a room or common area that may be shared with others.", Icon: Users },
];

const AMENITIES: { label: string; Icon: typeof Wifi }[] = [
  { label: "WiFi", Icon: Wifi },
  { label: "Kitchen", Icon: UtensilsCrossed },
  { label: "Air conditioning", Icon: Snowflake },
  { label: "Heating", Icon: Thermometer },
  { label: "TV", Icon: Tv },
  { label: "Workspace", Icon: Laptop },
  { label: "Free parking", Icon: Car },
  { label: "Pool", Icon: Waves },
  { label: "Hot tub", Icon: Bath },
  { label: "Washer", Icon: WashingMachine },
  { label: "Pets allowed", Icon: PawPrint },
  { label: "Gym", Icon: Dumbbell },
  { label: "Fireplace", Icon: Flame },
  { label: "Beach access", Icon: Umbrella },
  { label: "EV charger", Icon: Zap },
  { label: "Hairdryer", Icon: Wind },
];

interface WizardState {
  propertyType: string;
  placeType: string; // local only — no backend field
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  title: string;
  description: string;
  photos: string[]; // urls; index 0 is the cover
  priceRupees: string;
  cleaningRupees: string;
}

export default function ListingWizard({
  initial,
  listingId,
}: {
  initial?: ListingDetail;
  listingId?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const editing = Boolean(listingId);

  const [s, setS] = useState<WizardState>({
    propertyType: initial?.propertyType ?? "",
    placeType: initial ? "entire" : "",
    city: initial?.city ?? "",
    country: initial?.country ?? "",
    latitude: initial?.latitude != null ? String(initial.latitude) : "",
    longitude: initial?.longitude != null ? String(initial.longitude) : "",
    guests: initial?.maxGuests ?? 2,
    bedrooms: initial?.bedrooms ?? 1,
    beds: initial?.beds ?? 1,
    bathrooms: initial?.bathrooms ?? 1,
    amenities: initial?.amenities ?? [],
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    photos: (initial?.photos ?? []).map((p) => p.url),
    priceRupees: initial ? String(Math.round(initial.pricePerNight / 100)) : "",
    cleaningRupees: initial ? String(Math.round(initial.cleaningFee / 100)) : "",
  });
  const set = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  const price = Number(s.priceRupees) || 0;

  // Each step: heading, subtext, body, and whether Next is allowed.
  const steps = useMemo(
    () => [
      {
        valid: s.propertyType !== "",
        node: (
          <StepShell
            title="Which of these best describes your place?"
            subtitle="Pick the option that fits best — you can refine details later."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PROPERTY_TYPES.map(({ label, Icon }) => {
                const value = label.toLowerCase();
                const on = s.propertyType === value;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => set("propertyType", value)}
                    className={`flex flex-col gap-3 rounded-xl border-2 p-4 text-left transition ${
                      on ? "border-ink bg-bg-soft/40" : "border-line hover:border-muted"
                    }`}
                  >
                    <Icon size={28} strokeWidth={1.5} className="text-ink" aria-hidden />
                    <span className="text-sm font-medium text-ink">{label}</span>
                  </button>
                );
              })}
            </div>
          </StepShell>
        ),
      },
      {
        valid: s.placeType !== "",
        node: (
          <StepShell title="What type of place will guests have?">
            <div className="space-y-3">
              {PLACE_TYPES.map(({ key, title, subtitle, Icon }) => {
                const on = s.placeType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set("placeType", key)}
                    className={`flex w-full items-center justify-between gap-4 rounded-xl border-2 p-5 text-left transition ${
                      on ? "border-ink bg-bg-soft/40" : "border-line hover:border-muted"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-ink">{title}</p>
                      <p className="mt-1 text-sm text-muted">{subtitle}</p>
                    </div>
                    <Icon size={28} strokeWidth={1.5} className="shrink-0 text-ink" aria-hidden />
                  </button>
                );
              })}
            </div>
          </StepShell>
        ),
      },
      {
        valid: s.city.trim() !== "" && s.country.trim() !== "",
        node: (
          <StepShell
            title="Where's your place located?"
            subtitle="Guests will only get your exact address once they've booked."
          >
            <div className="space-y-4">
              <div>
                <span className="mb-1.5 block text-sm font-medium text-ink">City</span>
                <CityAutocomplete
                  value={s.city}
                  onCityChange={(city) => set("city", city)}
                  onSelect={(c) => {
                    set("city", c.city);
                    set("country", c.country);
                    set("latitude", String(c.lat));
                    set("longitude", String(c.lng));
                  }}
                  inputClass={inputClass}
                />
              </div>
              <Field label="Country">
                <input
                  value={s.country}
                  onChange={(e) => set("country", e.target.value)}
                  placeholder="e.g. USA"
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Latitude (optional)">
                  <input
                    value={s.latitude}
                    onChange={(e) => set("latitude", e.target.value)}
                    inputMode="decimal"
                    placeholder="34.0522"
                    className={inputClass}
                  />
                </Field>
                <Field label="Longitude (optional)">
                  <input
                    value={s.longitude}
                    onChange={(e) => set("longitude", e.target.value)}
                    inputMode="decimal"
                    placeholder="-118.2437"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </StepShell>
        ),
      },
      {
        valid: s.guests >= 1,
        node: (
          <StepShell title="Share some basics about your place">
            <div className="divide-y divide-line-soft">
              <StepperRow label="Guests" value={s.guests} min={1} onChange={(v) => set("guests", v)} />
              <StepperRow label="Bedrooms" value={s.bedrooms} min={0} onChange={(v) => set("bedrooms", v)} />
              <StepperRow label="Beds" value={s.beds} min={0} onChange={(v) => set("beds", v)} />
              <StepperRow label="Bathrooms" value={s.bathrooms} min={0} onChange={(v) => set("bathrooms", v)} />
            </div>
          </StepShell>
        ),
      },
      {
        valid: true,
        node: (
          <StepShell
            title="Tell guests what your place has to offer"
            subtitle="You can add more amenities after you publish."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AMENITIES.map(({ label, Icon }) => {
                const on = s.amenities.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      set(
                        "amenities",
                        on ? s.amenities.filter((a) => a !== label) : [...s.amenities, label]
                      )
                    }
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                      on ? "border-ink bg-bg-soft/40" : "border-line hover:border-muted"
                    }`}
                  >
                    <Icon size={22} strokeWidth={1.5} className="shrink-0 text-ink" aria-hidden />
                    <span className="text-sm font-medium text-ink">{label}</span>
                  </button>
                );
              })}
            </div>
          </StepShell>
        ),
      },
      {
        valid: s.title.trim() !== "",
        node: (
          <StepShell title="Now, let's give your place a title" subtitle="Short titles work best. Then add a description.">
            <div className="space-y-6">
              <Field label="Title">
                <input
                  value={s.title}
                  onChange={(e) => set("title", e.target.value)}
                  maxLength={60}
                  placeholder="Sunlit loft in the arts district"
                  className={`${inputClass} text-lg`}
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={s.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={5}
                  placeholder="Share what makes your place special…"
                  className={inputClass}
                />
              </Field>
            </div>
          </StepShell>
        ),
      },
      {
        // PHOTO MINIMUM — chosen: (A) require at least 1 photo to proceed.
        valid: s.photos.length >= 1,
        node: (
          <StepShell title="Add some photos of your place" subtitle="No upload here — paste image URLs. The first photo is your cover.">
            <div className="space-y-5">
              <div className="rounded-2xl border-2 border-dashed border-line p-6">
                <p className="text-sm text-muted">Paste an image URL and press Add</p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPhoto();
                      }
                    }}
                    placeholder="https://…"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={addPhoto}
                    className="shrink-0 rounded-lg bg-ink px-5 text-sm font-semibold text-bg transition hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
              </div>

              {s.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {s.photos.map((url, i) => (
                    <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-bg-soft">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                      {i === 0 && (
                        <span className="absolute left-2 top-2 rounded-md bg-bg px-2 py-0.5 text-[11px] font-semibold text-ink shadow-sm">
                          Cover Photo
                        </span>
                      )}
                      <div className="absolute right-2 top-2 flex gap-1">
                        {i !== 0 && (
                          <button
                            type="button"
                            onClick={() => makeCover(i)}
                            className="rounded-md bg-bg px-2 py-0.5 text-[11px] font-medium text-ink shadow-sm"
                          >
                            Make cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          aria-label="Remove photo"
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-bg text-ink shadow-sm"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </StepShell>
        ),
      },
      {
        valid: price > 0,
        node: (
          <StepShell title="Now, set your price" subtitle="You can change it anytime.">
            <div className="flex flex-col items-center gap-8">
              <div className="flex items-center text-6xl font-bold text-ink">
                <span>₹</span>
                <input
                  value={s.priceRupees}
                  onChange={(e) => set("priceRupees", e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder="0"
                  className="w-48 bg-transparent text-center outline-none"
                  aria-label="Price per night in rupees"
                />
              </div>
              <p className="text-sm text-muted">
                {price > 0 ? `${formatMoney(price * 100)} per night` : "Enter a nightly price"}
              </p>
              <div className="w-full max-w-xs">
                <Field label="Cleaning fee (₹, optional)">
                  <input
                    value={s.cleaningRupees}
                    onChange={(e) => set("cleaningRupees", e.target.value.replace(/[^0-9]/g, ""))}
                    inputMode="numeric"
                    placeholder="0"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </StepShell>
        ),
      },
    ],
    [s, price, photoUrl]
  );

  function addPhoto() {
    const url = photoUrl.trim();
    if (!url) return;
    set("photos", [...s.photos, url]);
    setPhotoUrl("");
  }
  function removePhoto(i: number) {
    set("photos", s.photos.filter((_, idx) => idx !== i));
  }
  function makeCover(i: number) {
    const next = [...s.photos];
    const [chosen] = next.splice(i, 1);
    set("photos", [chosen, ...next]);
  }

  const isLast = step === steps.length - 1;
  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const exit = () => router.push("/hosting/listings");

  const back = () => {
    if (step === 0) return exit();
    setStep((n) => n - 1);
  };

  const next = async () => {
    if (!current.valid) return;
    if (!isLast) {
      setStep((n) => n + 1);
      return;
    }
    // Publish
    const lat = s.latitude.trim() ? Number(s.latitude) : undefined;
    const lng = s.longitude.trim() ? Number(s.longitude) : undefined;
    const payload: Record<string, unknown> = {
      title: s.title.trim(),
      description: s.description.trim(),
      propertyType: s.propertyType,
      city: s.city.trim(),
      country: s.country.trim(),
      pricePerNight: Number(s.priceRupees) * 100,
      cleaningFee: (Number(s.cleaningRupees) || 0) * 100,
      serviceFeePct: 0.14,
      maxGuests: s.guests,
      bedrooms: s.bedrooms,
      beds: s.beds,
      bathrooms: s.bathrooms,
      amenities: s.amenities,
      photos: s.photos.map((url, i) => ({ url, sortOrder: i, isCover: i === 0 })),
    };
    if (lat !== undefined && !Number.isNaN(lat)) payload.latitude = lat;
    if (lng !== undefined && !Number.isNaN(lng)) payload.longitude = lng;

    try {
      setPublishing(true);
      if (listingId) await api.patch(`/listings/${listingId}`, payload);
      else await api.post("/listings", payload);
      toast.success(editing ? "Listing updated" : "Listing published");
      router.push("/hosting/listings");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
      setPublishing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <Link href="/hosting/listings" className="flex items-center gap-1 text-brand" aria-label="StayFinder">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
            <path d="M12 2c1.6 0 2.9.9 3.9 2.9l5.4 12c.5 1.1.7 2 .7 2.8 0 1.9-1.3 3.3-3.2 3.3-1.1 0-2-.4-3.1-1.5L12 20.3l-3.6 1.2c-1.1 1.1-2 1.5-3.1 1.5-1.9 0-3.2-1.4-3.2-3.3 0-.8.2-1.7.7-2.8l5.4-12C9.1 2.9 10.4 2 12 2zm0 2.2c-.6 0-1.1.5-1.7 1.8L4.9 18c-.4.9-.5 1.5-.5 1.9 0 .8.5 1.3 1.3 1.3.6 0 1.1-.3 1.8-1l.2-.2.2-.5c1.3-2.7 2.8-4.9 4.1-4.9s2.8 2.2 4.1 4.9l.2.5.2.2c.7.7 1.2 1 1.8 1 .8 0 1.3-.5 1.3-1.3 0-.4-.1-1-.5-1.9L13.7 6c-.6-1.3-1.1-1.8-1.7-1.8z" />
          </svg>
          <span className="text-lg font-bold tracking-tight">stayfinder</span>
        </Link>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => toast.info("Help is on the way — coming soon")}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-bg-soft"
          >
            Questions?
          </button>
          <button
            type="button"
            onClick={exit}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-bg-soft"
          >
            Save &amp; exit
          </button>
        </div>
      </header>

      {/* Center content */}
      <main className="flex flex-1 items-center justify-center px-6 pb-32 pt-4">
        <div className="w-full max-w-2xl">{current.node}</div>
      </main>

      {/* Bottom bar: progress + Back / Next(Publish) */}
      <footer className="fixed inset-x-0 bottom-0 z-40 bg-bg">
        <div className="h-1.5 w-full bg-line-soft">
          <div className="h-full bg-ink transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between px-6 py-4 lg:px-12">
          <button
            type="button"
            onClick={back}
            className="text-sm font-semibold text-ink underline underline-offset-4"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!current.valid || publishing}
            className={`rounded-lg px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-40 ${
              isLast ? "bg-brand-gradient hover:brightness-95" : "bg-ink hover:opacity-90"
            }`}
          >
            {isLast
              ? publishing
                ? editing
                  ? "Saving…"
                  : "Publishing…"
                : editing
                  ? "Save changes"
                  : "Publish"
              : "Next"}
          </button>
        </div>
      </footer>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink outline-none transition focus:border-ink";

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-[32px] font-bold leading-tight text-ink">{title}</h1>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function StepperRow({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) {
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:border-line-soft disabled:text-line disabled:hover:border-line-soft";
  return (
    <div className="flex items-center justify-between py-5">
      <span className="text-ink">{label}</span>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Decrease ${label}`} className={btn}>
          <Minus size={16} />
        </button>
        <span className="w-6 text-center tabular-nums text-ink">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`} className={btn}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
