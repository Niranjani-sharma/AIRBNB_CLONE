"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getToken, decodeUserFromToken } from "@/lib/auth";

// Keeps the backend role in sync with host routes: entering /hosting/* while the
// token role is still guest auto-switches to host, so host-only API calls work
// and the nav (host mode) never contradicts the account role. Runs on path change.
export default function HostModeSync() {
  const pathname = usePathname();
  const { switchRole, refresh } = useAuth();

  useEffect(() => {
    if (!pathname.startsWith("/hosting")) return;
    if (!getToken()) return;
    if (decodeUserFromToken(getToken())?.role === "guest") {
      switchRole()
        .then(() => refresh())
        .catch(() => {
          /* ignore; server still enforces authz */
        });
    }
    // Only re-run on path change; switchRole/refresh are stable enough for this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
