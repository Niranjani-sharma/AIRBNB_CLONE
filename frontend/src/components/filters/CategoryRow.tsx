"use client";
import { useRouter, useSearchParams } from "next/navigation";

// Horizontally scrollable category strip (icon + label) at the top of the
// explore grid — the interaction pattern Airbnb uses. Values map to the seed
// data's property_type so the filter narrows real results.
const CATEGORIES: { label: string; value: string; icon: string }[] = [
  { label: "Apartments", value: "apartment", icon: "🏢" },
  { label: "Cabins", value: "cabin", icon: "🛖" },
  { label: "Houses", value: "house", icon: "🏠" },
  { label: "Cottages", value: "cottage", icon: "🏡" },
  { label: "Villas", value: "villa", icon: "🏝️" },
];

export default function CategoryRow() {
  const router = useRouter();
  const sp = useSearchParams();
  const active = sp.get("property_type");

  const select = (value: string) => {
    const params = new URLSearchParams(sp.toString());
    active === value ? params.delete("property_type") : params.set("property_type", value);
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="no-scrollbar flex gap-10 overflow-x-auto">
      {CATEGORIES.map((c) => {
        const isActive = active === c.value;
        return (
          <button
            key={c.value}
            onClick={() => select(c.value)}
            className={`group flex min-w-[64px] flex-col items-center gap-2 whitespace-nowrap border-b-2 pb-3 pt-1 transition ${
              isActive
                ? "border-hof text-hof"
                : "border-transparent text-foggy hover:border-gray-300 hover:text-hof"
            }`}
          >
            <span className={`text-[28px] transition ${isActive ? "" : "opacity-70 group-hover:opacity-100"}`} aria-hidden>
              {c.icon}
            </span>
            <span className="text-xs font-semibold">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
