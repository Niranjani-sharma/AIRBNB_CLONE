"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";

// The listing wizard (create/edit) is a full-screen flow with its own top/bottom
// bars, so it opts out of the global navbar, container, and footer.
const FULLSCREEN = [
  /^\/hosting\/listings\/new$/,
  /^\/hosting\/listings\/[^/]+\/edit$/,
];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullscreen = FULLSCREEN.some((re) => re.test(pathname));

  if (fullscreen) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container>{children}</Container>
      </main>
      <Footer />
    </div>
  );
}
