// Footer: white with a hairline top border, three link columns, and a bottom
// bar with a locale/currency group + social icons. Original placeholder links.
import Container from "@/components/ui/Container";

const COLUMNS: { title: string; links: string[] }[] = [
  { title: "Support", links: ["Help Centre", "Safety information", "Cancellation options", "Report a concern"] },
  { title: "Hosting", links: ["List your space", "Host resources", "Community forum", "Responsible hosting"] },
  { title: "StayFinder", links: ["Newsroom", "Careers", "Investors", "How it works"] },
];

const socialClass = "text-ink transition hover:text-brand";

function Facebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="Facebook">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}
function XTwitter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-label="X">
      <path d="M18.2 2H21l-6.6 7.5L22 22h-6.8l-4.3-5.6L5.9 22H3l7.1-8L2.6 2h6.9l3.9 5.1L18.2 2zm-1.2 18h1.5L7.1 3.9H5.5L17 20z" />
    </svg>
  );
}
function Instagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Instagram">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-line-soft bg-bg">
      <Container className="py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-bold text-ink">{col.title}</h3>
              <ul className="space-y-3 text-sm text-ink">
                {col.links.map((l) => (
                  <li key={l}>
                    <span className="cursor-pointer hover:underline">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line-soft pt-6 text-sm text-ink md:flex-row">
          <p className="text-center md:text-left">
            © 2026 StayFinder ·{" "}
            <span className="cursor-pointer hover:underline">Privacy</span> ·{" "}
            <span className="cursor-pointer hover:underline">Terms</span> ·{" "}
            <span className="cursor-pointer hover:underline">Sitemap</span>
            <span className="ml-1 text-xs text-muted">· not affiliated with Airbnb</span>
          </p>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 font-medium">
              <span className="flex items-center gap-1">
                <span aria-hidden>🌐</span> English (IN)
              </span>
              <span>₹ INR</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Facebook" className={socialClass}><Facebook /></a>
              <a href="#" aria-label="X" className={socialClass}><XTwitter /></a>
              <a href="#" aria-label="Instagram" className={socialClass}><Instagram /></a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
