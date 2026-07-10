import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
          <AuthProvider>
            <AuthModalProvider>
              <WishlistProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="mx-auto w-full max-w-content flex-1 px-6 md:px-10">
                    {children}
                  </main>
                  <Footer />
                </div>
              </WishlistProvider>
            </AuthModalProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
