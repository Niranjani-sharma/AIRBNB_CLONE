import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Presence-gate for authenticated areas. The `token` cookie only drives redirect
// UX; real authorization is enforced by FastAPI on every request.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login" || path === "/signup";
  const token = request.cookies.get("token")?.value || "";

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
}

// Browsing the explore grid + listing detail stays public.
export const config = {
  matcher: ["/login", "/signup", "/trips", "/wishlists", "/book/:path*", "/hosting/:path*"],
};
