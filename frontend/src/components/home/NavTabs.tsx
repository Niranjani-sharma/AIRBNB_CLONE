"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useToast } from "@/lib/toast-context";

// Header category tabs: All / Homes / Experiences / Services.
// - All   → "/"            (everything)
// - Homes → "/?tab=homes"  (only homes — future Experiences/Services excluded)
// - Experiences / Services → mocked "Coming soon" until their content exists.
const TABS: { label: string; icon: string; tab?: string; soon?: boolean }[] = [
  { label: "All", icon: "🌐" },
  { label: "Homes", icon: "🏠", tab: "homes" },
  { label: "Experiences", icon: "🎈", soon: true },
  { label: "Services", icon: "🛎️", soon: true },
];

export default function NavTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const toast = useToast();

  // Active tab derived from the URL so the underline reflects the current view.
  const currentTab = pathname === "/" ? sp.get("tab") || "all" : "";

  const go = (t: (typeof TABS)[number]) => {
    if (t.soon) {
      toast.info("Coming soon");
      return;
    }
    router.push(t.tab ? `/?tab=${t.tab}` : "/");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="flex items-center gap-8">
      {TABS.map((t) => {
        const active = !t.soon && currentTab === (t.tab ?? "all");
        return (
          <button
            key={t.label}
            onClick={() => go(t)}
            aria-current={active ? "page" : undefined}
            className={`flex cursor-pointer items-center gap-2 border-b-2 pb-2 pt-1 text-sm font-medium transition ${
              active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <span className="text-xl" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
