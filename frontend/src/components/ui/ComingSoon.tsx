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
    <div className="flex items-start justify-between gap-3 rounded-card border border-dashed border-border p-4">
      <div>
        <p className="text-sm font-medium text-hof">{title}</p>
        <p className="text-sm text-foggy">{children}</p>
      </div>
      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-foggy">
        Coming soon
      </span>
    </div>
  );
}
