"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal";
import { useDisplayMode, useRoleSwitch } from "@/lib/host-mode";
import SearchBar from "@/components/search/SearchBar";
import CompactSearchPill from "@/components/search/CompactSearchPill";
import NavTabs from "@/components/home/NavTabs";
import HostTabs from "@/components/host/HostTabs";
import UserMenu from "@/components/UserMenu";
import Container from "@/components/ui/Container";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { user } = useAuth();
  const authModal = useAuthModal();
  // Tabs AND the toggle label both derive from this one value → they can't disagree.
  const mode = useDisplayMode();
  const { goHost, goGuest } = useRoleSwitch();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleHosting = () => {
    if (!user) {
      authModal.open("signup");
      return;
    }
    if (mode === "host") goGuest();
    else goHost();
  };

  const roleLabel = mode === "host" ? "Switch to travelling" : "Switch to hosting";

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-bg">
      <Container className="flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-1 text-brand" aria-label="StayFinder home">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden>
            <path d="M12 2c1.6 0 2.9.9 3.9 2.9l5.4 12c.5 1.1.7 2 .7 2.8 0 1.9-1.3 3.3-3.2 3.3-1.1 0-2-.4-3.1-1.5L12 20.3l-3.6 1.2c-1.1 1.1-2 1.5-3.1 1.5-1.9 0-3.2-1.4-3.2-3.3 0-.8.2-1.7.7-2.8l5.4-12C9.1 2.9 10.4 2 12 2zm0 2.2c-.6 0-1.1.5-1.7 1.8L4.9 18c-.4.9-.5 1.5-.5 1.9 0 .8.5 1.3 1.3 1.3.6 0 1.1-.3 1.8-1l.2-.2.2-.5c1.3-2.7 2.8-4.9 4.1-4.9s2.8 2.2 4.1 4.9l.2.5.2.2c.7.7 1.2 1 1.8 1 .8 0 1.3-.5 1.3-1.3 0-.4-.1-1-.5-1.9L13.7 6c-.6-1.3-1.1-1.8-1.7-1.8z" />
          </svg>
          <span className="text-xl font-bold tracking-tight">stayfinder</span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          {mode === "host" ? (
            // Host mode (on /hosting/*): dashboard tabs replace the guest tabs / search.
            <HostTabs />
          ) : isHome ? (
            scrolled ? (
              <Suspense fallback={<div className="h-12" />}>
                <CompactSearchPill onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
              </Suspense>
            ) : (
              <NavTabs />
            )
          ) : (
            <Suspense fallback={<div className="h-14 w-[560px]" />}>
              <SearchBar compact />
            </Suspense>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleHosting}
            className="hidden rounded-pill px-4 py-2 text-sm font-medium hover:bg-bg-soft md:block"
          >
            {user ? roleLabel : "Become a host"}
          </button>
          <UserMenu />
        </div>
      </Container>
    </header>
  );
}
