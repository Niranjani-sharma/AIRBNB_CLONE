"use client";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal";
import { useToast } from "@/lib/toast-context";
import SearchBar from "@/components/search/SearchBar";
import CompactSearchPill from "@/components/search/CompactSearchPill";
import NavTabs from "@/components/home/NavTabs";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { user, logout, switchRole } = useAuth();
  const authModal = useAuthModal();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const close = () => setMenuOpen(false);
  const soon = () => {
    close();
    toast.info("Coming soon");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLogout = async () => {
    close();
    await logout();
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  };

  const toggleHosting = async () => {
    close();
    try {
      const u = await switchRole();
      const nowHost = u.role === "host";
      toast.success(nowHost ? "You're now in hosting mode" : "You're now in travelling mode");
      router.push(nowHost ? "/hosting/listings" : "/");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const item = "block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-bg-soft";
  const roleLabel = user?.role === "host" ? "Switch to travelling" : "Switch to hosting";

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-bg">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-3 md:px-10">
        <Link href="/" className="flex items-center gap-1 text-brand" aria-label="StayFinder home">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden>
            <path d="M12 2c1.6 0 2.9.9 3.9 2.9l5.4 12c.5 1.1.7 2 .7 2.8 0 1.9-1.3 3.3-3.2 3.3-1.1 0-2-.4-3.1-1.5L12 20.3l-3.6 1.2c-1.1 1.1-2 1.5-3.1 1.5-1.9 0-3.2-1.4-3.2-3.3 0-.8.2-1.7.7-2.8l5.4-12C9.1 2.9 10.4 2 12 2zm0 2.2c-.6 0-1.1.5-1.7 1.8L4.9 18c-.4.9-.5 1.5-.5 1.9 0 .8.5 1.3 1.3 1.3.6 0 1.1-.3 1.8-1l.2-.2.2-.5c1.3-2.7 2.8-4.9 4.1-4.9s2.8 2.2 4.1 4.9l.2.5.2.2c.7.7 1.2 1 1.8 1 .8 0 1.3-.5 1.3-1.3 0-.4-.1-1-.5-1.9L13.7 6c-.6-1.3-1.1-1.8-1.7-1.8z" />
          </svg>
          <span className="text-xl font-bold tracking-tight">stayfinder</span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          {isHome ? (
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
          {user ? (
            <button
              onClick={toggleHosting}
              className="hidden rounded-pill px-4 py-2 text-sm font-medium hover:bg-bg-soft md:block"
            >
              {roleLabel}
            </button>
          ) : (
            <button
              onClick={() => authModal.open("signup")}
              className="hidden rounded-pill px-4 py-2 text-sm font-medium hover:bg-bg-soft md:block"
            >
              Become a host
            </button>
          )}
          <ThemeToggle className="hidden md:flex" />
          <button
            aria-label="Choose language"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-base hover:bg-bg-soft md:flex"
          >
            🌐
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Main menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-pill border border-line py-1 pl-3 pr-1 hover:shadow-pill"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
              </svg>
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ink text-sm font-medium text-bg">
                {user?.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="h-8 w-8 object-cover" />
                ) : user ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" />
                  </svg>
                )}
              </span>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={close} />
                <div className="pop absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-bg py-2 shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm font-semibold text-ink">Hi, {user.name.split(" ")[0]}</div>
                      <Link href="/wishlists" onClick={close} className={item}>Wishlists</Link>
                      <Link href="/trips" onClick={close} className={item}>Trips</Link>
                      <button onClick={soon} className={item}>Messages</button>
                      {user.role === "host" && (
                        <Link href="/hosting/listings" onClick={close} className={item}>Host dashboard</Link>
                      )}
                      <div className="my-1 border-t border-line-soft" />
                      <button onClick={soon} className={item}>Account settings</button>
                      <button onClick={soon} className={item}>Help Centre</button>
                      <button onClick={toggleHosting} className={`${item} font-medium`}>{roleLabel}</button>
                      <div className="my-1 border-t border-line-soft" />
                      <button onClick={onLogout} className={item}>Log out</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { close(); authModal.open("signup"); }} className={`${item} font-semibold`}>Sign up</button>
                      <button onClick={() => { close(); authModal.open("login"); }} className={item}>Log in</button>
                      <div className="my-1 border-t border-line-soft" />
                      <button onClick={soon} className={item}>Help Centre</button>
                      <button onClick={() => { close(); authModal.open("signup"); }} className={item}>Become a host</button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
