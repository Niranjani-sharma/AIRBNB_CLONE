import Image from "next/image";
import type { HostBrief } from "@/lib/types";

// "Meet your host" block (Airbnb detail-page pattern). Messaging is mocked per
// the brief, so the contact button is a disabled placeholder.
export default function HostCard({
  host,
  ratingAvg,
  ratingCount,
}: {
  host: HostBrief;
  ratingAvg: number | null;
  ratingCount: number;
}) {
  return (
    <section className="border-t border-line py-8">
      <h2 className="mb-5 text-xl font-semibold">Meet your host</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
        <div className="flex items-center gap-5 rounded-2xl border border-line p-6 shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-2xl font-semibold text-bg">
            {host.avatarUrl ? (
              <Image src={host.avatarUrl} alt={host.name} width={80} height={80} className="h-20 w-20 object-cover" />
            ) : (
              host.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-2xl font-semibold">{host.name}</p>
            <p className="text-sm text-muted">{host.isSuperhost ? "Superhost" : "Host"}</p>
          </div>
          <div className="ml-auto space-y-2 border-l border-line pl-5 text-center">
            <div>
              <p className="text-lg font-semibold">{ratingCount}</p>
              <p className="text-[11px] text-muted">Reviews</p>
            </div>
            <div>
              <p className="text-lg font-semibold">
                {ratingAvg != null ? ratingAvg.toFixed(2) : "New"} ★
              </p>
              <p className="text-[11px] text-muted">Rating</p>
            </div>
          </div>
        </div>

        <div>
          {host.isSuperhost && (
            <p className="mb-3 text-sm text-muted">
              <span className="font-medium text-ink">{host.name} is a Superhost.</span>{" "}
              Superhosts are experienced, highly rated hosts committed to great stays.
            </p>
          )}
          <p className="mb-4 text-sm text-muted">Response rate: 100% · Responds within an hour</p>
          <button
            disabled
            className="cursor-not-allowed rounded-lg bg-bg-soft px-6 py-3 text-sm font-medium text-muted"
          >
            Message host · Coming soon
          </button>
        </div>
      </div>
    </section>
  );
}
