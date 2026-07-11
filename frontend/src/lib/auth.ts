import type { Role, User } from "@/lib/types";

// Client-side token storage. The JWT lives in a readable `token` cookie so that
// (a) the axios client can attach it as a Bearer header and (b) Next.js
// middleware can gate protected routes by presence. All real authorization is
// enforced server-side by FastAPI on every request; this cookie only drives UX.
const COOKIE = "token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Base64url decode that works both in the browser (atob) and on the server (Buffer).
function b64urlDecode(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof atob === "function") return atob(b64);
  return Buffer.from(b64, "base64").toString("binary");
}

// Decode the role/id/email carried inside the JWT WITHOUT verifying the
// signature — purely to seed the UI's auth state synchronously (server + client)
// so the first render shows the correct role. Real authorization stays server-side.
// Returns a partial User (name/avatar filled in later by GET /users/me).
export function decodeUserFromToken(token: string | null): User | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(b64urlDecode(parts[1])) as {
      sub?: string;
      email?: string;
      role?: Role;
      exp?: number;
    };
    if (payload.role !== "guest" && payload.role !== "host") return null;
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) return null; // expired
    return {
      id: payload.sub ? Number(payload.sub) : 0,
      name: "",
      email: payload.email ?? "",
      avatarUrl: null,
      role: payload.role,
      isSuperhost: false,
    };
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE}; samesite=lax`;
}

export function clearToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=; path=/; max-age=0; samesite=lax`;
}
