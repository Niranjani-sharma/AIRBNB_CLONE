"use client";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";

// Header category tabs per the design brief §4: All / Homes / Experiences / Services
// (icon + label, active tab underlined). Only All/Homes are functional; the
// others are mocked "Coming soon" (allowed by the brief).
const TABS = [
  { label: "All", icon: "🌐", active: true, href: "/" },
  { label: "Homes", icon: "🏠", href: "/" },
  { label: "Experiences", icon: "🎈", soon: true },
  { label: "Services", icon: "🛎️", soon: true },
];

export default function NavTabs() {
  const router = useRouter();
  const toast = useToast();
  return (
    <nav className="flex items-center gap-8">
      {TABS.map((t) => (
        <button
          key={t.label}
          onClick={() => (t.soon ? toast.info("Coming soon") : router.push(t.href!))}
          className={`flex items-center gap-2 border-b-2 pb-2 pt-1 text-sm font-medium transition ${
            t.active
              ? "border-ink text-ink"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <span className="text-xl" aria-hidden>
            {t.icon}
          </span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
