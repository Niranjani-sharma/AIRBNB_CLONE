import Link from "next/link";

// Honest, invitational empty state (the design brief §8: written in the
// interface's voice, offering the next action).
export default function EmptyState({
  title,
  body,
  ctaLabel,
  ctaHref,
  icon = "🧳",
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="mb-3 text-4xl" aria-hidden>
        {icon}
      </span>
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-5 rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
