"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { getToken, decodeUserFromToken } from "@/lib/auth";

export type DisplayMode = "host" | "guest";

// The nav's display mode is derived SYNCHRONOUSLY from the pathname — guest by
// default, host only on /hosting/*. This is identical on server and client
// (usePathname is stable during hydration), so there's no role-based flash and
// the tabs + toggle label always agree (both read this one value).
export function useDisplayMode(): DisplayMode {
  const pathname = usePathname();
  return pathname.startsWith("/hosting") ? "host" : "guest";
}

// Role-switch actions used by the header link and the user menu. switch-role is
// only called when the backend role doesn't already match the target, so a stray
// double-flip can't happen; the fresh token it returns replaces the stored one
// (handled inside auth-context's switchRole).
export function useRoleSwitch() {
  const router = useRouter();
  const toast = useToast();
  const { switchRole } = useAuth();

  const ensure = async (target: DisplayMode): Promise<boolean> => {
    const role = decodeUserFromToken(getToken())?.role;
    if (role !== target) {
      await switchRole();
      return true;
    }
    return false;
  };

  const goHost = async () => {
    try {
      const switched = await ensure("host");
      if (switched) toast.success("You're now in hosting mode");
      router.push("/hosting/listings");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const goGuest = async () => {
    try {
      const switched = await ensure("guest");
      if (switched) toast.success("You're now in travelling mode");
      router.push("/");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return { goHost, goGuest };
}
