import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Plus_Jakarta_Sans } from "next/font/google";
import AppChrome from "@/components/layout/AppChrome";
import HostModeSync from "@/components/host/HostModeSync";
import { decodeUserFromToken } from "@/lib/auth";
import { ToastProvider } from "@/lib/toast-context";
import { AuthProvider } from "@/lib/auth-context";
import { AuthModalProvider } from "@/lib/auth-modal";
import { WishlistProvider } from "@/lib/wishlist";

// Airbnb's Cereal is proprietary; Plus Jakarta Sans is the closest free match (the design brief §1).
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "StayFinder — Airbnb clone",
  description: "Discover, book, and host short-term stays.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Seed auth state from the token cookie during SSR so the nav renders the
  // correct role on the first paint (no guest→host flash on refresh).
  const initialUser = decodeUserFromToken(cookies().get("token")?.value ?? null);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the saved / preferred theme before paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();",
          }}
        />
      </head>
      <body className={`${jakarta.className} bg-bg text-ink`}>
        <ToastProvider>
          <AuthProvider initialUser={initialUser}>
            <AuthModalProvider>
              <WishlistProvider>
                <HostModeSync />
                <AppChrome>{children}</AppChrome>
              </WishlistProvider>
            </AuthModalProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
