// Placeholder for sections the brief allows to be mocked (messaging between
// guest & host, identity verification). Present as a clear "Coming soon".
export default function ComingSoon({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-card border border-dashed border-line p-4">
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-sm text-muted">{children}</p>
      </div>
      <span className="shrink-0 rounded-full bg-bg-soft px-2 py-0.5 text-xs text-muted">
        Coming soon
      </span>
    </div>
  );
}
