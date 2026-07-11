"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Luggage,
  MessageSquare,
  CircleUser,
  Bell,
  Settings,
  Globe,
  HelpCircle,
  Moon,
  Sun,
  Menu,
  LogOut,
  Home,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal";
import { useToast } from "@/lib/toast-context";
import { useRoleSwitch } from "@/lib/host-mode";

// Row shared styling: ~44px tall, icon + label, hover fill #F7F7F7.
function Row({
  icon: Icon,
  label,
  onClick,
  href,
  right,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  right?: React.ReactNode;
}) {
  const inner = (
    <>
      <Icon size={16} className="shrink-0 text-ink" aria-hidden />
      <span className="flex-1 text-sm text-ink">{label}</span>
      {right}
    </>
  );
  const cls = "flex h-11 w-full items-center gap-3 px-4 text-left hover:bg-bg-soft";
  return href ? (
    <Link href={href} onClick={onClick} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

const Divider = () => <div className="my-2 border-t border-line-soft" />;

export default function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const authModal = useAuthModal();
  const toast = useToast();
  const { goHost } = useRoleSwitch();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const close = () => setOpen(false);
  const soon = () => {
    close();
    toast.info("Coming soon");
  };

  const toggleDark = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
    setDark(next);
  };

  const onLogout = async () => {
    close();
    await logout();
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  };

  // Go to the host dashboard (switching role to host first if needed). Shared
  // with the header's toggle so behavior/token handling stays identical.
  const goHosting = () => {
    close();
    if (!user) {
      authModal.open("signup");
      return;
    }
    goHost();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Main menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-pill border border-line py-1 pl-3 pr-1 hover:shadow-pill"
      >
        <Menu size={18} className="text-ink" aria-hidden />
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand/15 text-sm font-semibold text-brand">
          {user?.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="h-8 w-8 object-cover" />
          ) : user ? (
            user.name.charAt(0).toUpperCase()
          ) : (
            <CircleUser size={20} className="text-muted" aria-hidden />
          )}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="pop absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-bg py-2 shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
            {user ? (
              <>
                <Row icon={Heart} label="Wishlists" href="/wishlists" onClick={close} />
                <Row icon={Luggage} label="Trips" href="/trips" onClick={close} />
                <Row icon={LayoutGrid} label="Manage listings" onClick={goHosting} />
                <Row icon={MessageSquare} label="Messages" onClick={soon} />
                <Row icon={CircleUser} label="Profile" onClick={soon} />
                <Divider />
                <Row icon={Bell} label="Notifications" onClick={soon} />
                <Row icon={Settings} label="Account settings" onClick={soon} />
                <Row icon={Globe} label="Languages & currency" onClick={soon} />
                <Row icon={HelpCircle} label="Help Centre" onClick={soon} />
                <Row
                  icon={dark ? Sun : Moon}
                  label={dark ? "Light mode" : "Dark mode"}
                  onClick={toggleDark}
                />
                <Divider />
                <button
                  onClick={goHosting}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-bg-soft"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {user.role === "host" ? "Manage listings" : "Become a host"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {user.role === "host"
                        ? "Manage your listings and bookings."
                        : "It's easy to start hosting and earn extra income."}
                    </p>
                  </div>
                  {user.role === "host" ? (
                    <LayoutGrid size={28} className="shrink-0 text-ink" aria-hidden />
                  ) : (
                    <Home size={28} className="shrink-0 text-ink" aria-hidden />
                  )}
                </button>
                <Divider />
                <Row icon={LogOut} label="Log out" onClick={onLogout} />
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    close();
                    authModal.open("signup");
                  }}
                  className="flex h-11 w-full items-center px-4 text-left text-sm font-semibold text-ink hover:bg-bg-soft"
                >
                  Sign up
                </button>
                <button
                  onClick={() => {
                    close();
                    authModal.open("login");
                  }}
                  className="flex h-11 w-full items-center px-4 text-left text-sm text-ink hover:bg-bg-soft"
                >
                  Log in
                </button>
                <Divider />
                <Row icon={Globe} label="Languages & currency" onClick={soon} />
                <Row icon={HelpCircle} label="Help Centre" onClick={soon} />
                <Row
                  icon={dark ? Sun : Moon}
                  label={dark ? "Light mode" : "Dark mode"}
                  onClick={toggleDark}
                />
                <Divider />
                <Row icon={Home} label="Become a host" onClick={goHosting} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
