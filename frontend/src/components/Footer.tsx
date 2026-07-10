// Marketing-style footer to round out the marketplace feel. All original
// placeholder links (the messaging/help sections are mocked per the brief).
const COLUMNS: { title: string; links: string[] }[] = [
  { title: "Support", links: ["Help Centre", "Safety information", "Cancellation options", "Report a concern"] },
  { title: "Community", links: ["Guest referrals", "Gift cards", "Community forum", "Accessibility"] },
  { title: "Hosting", links: ["List your space", "Host resources", "Community forum", "Responsible hosting"] },
  { title: "StayFinder", links: ["Newsroom", "Careers", "Investors", "How it works"] },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-bg-soft">
      <div className="mx-auto max-w-content px-6 py-10 md:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-semibold text-ink">{col.title}</h3>
              <ul className="space-y-2 text-sm text-muted">
                {col.links.map((l) => (
                  <li key={l}>
                    <span className="cursor-pointer hover:text-ink hover:underline">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-line pt-6 text-sm text-muted md:flex-row">
          <p>© 2026 StayFinder · A student portfolio clone (not affiliated with Airbnb)</p>
          <p className="flex items-center gap-2">
            <span className="font-medium text-brand">stayfinder</span> · Built with Next.js &amp; FastAPI
          </p>
        </div>
      </div>
    </footer>
  );
}
