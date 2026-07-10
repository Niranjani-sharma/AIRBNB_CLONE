// Client-side token storage. The JWT lives in a readable `token` cookie so that
// (a) the axios client can attach it as a Bearer header and (b) Next.js
// middleware can gate protected routes by presence. All real authorization is
// enforced server-side by FastAPI on every request; this cookie only drives UX.
const COOKIE = "token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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
