"use client";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/lib/toast-context";

// Center nav for host mode: Today / Calendar / Listings / Messages.
// Only Listings is real (→ dashboard); the rest are "Coming soon".
const TABS: { label: string; href?: string }[] = [
  { label: "Today" },
  { label: "Calendar" },
  { label: "Listings", href: "/hosting/listings" },
  { label: "Messages" },
];

export default function HostTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  return (
    <nav className="flex items-center gap-8">
      {TABS.map((t) => {
        const active = t.href ? pathname.startsWith(t.href) : false;
        return (
          <button
            key={t.label}
            onClick={() => (t.href ? router.push(t.href) : toast.info("Coming soon"))}
            aria-current={active ? "page" : undefined}
            className={`cursor-pointer border-b-2 pb-2 pt-1 text-sm font-medium transition ${
              active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
