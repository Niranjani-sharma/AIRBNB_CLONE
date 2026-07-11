"use client";
import { CalendarX, ShieldCheck, Key, type LucideIcon } from "lucide-react";
import { useToast } from "@/lib/toast-context";

// "Things to know" — three columns, each with a line icon + a "Learn more" link.
// Original placeholder house rules / safety / cancellation copy.
export default function ThingsToKnow({ maxGuests }: { maxGuests: number }) {
  const toast = useToast();
  const columns: { title: string; icon: LucideIcon; items: string[] }[] = [
    {
      title: "House rules",
      icon: CalendarX,
      items: ["Check-in after 2:00 PM", "Checkout before 11:00 AM", `${maxGuests} guests maximum`],
    },
    {
      title: "Safety & property",
      icon: ShieldCheck,
      items: ["Smoke alarm", "Carbon monoxide alarm", "Exterior security cameras on property"],
    },
    {
      title: "Cancellation policy",
      icon: Key,
      items: [
        "Free cancellation before check-in",
        "Review the host's full policy for details",
        "You won't be charged until you reserve",
      ],
    },
  ];

  return (
    <section className="border-b border-line-soft py-10">
      <h2 className="mb-6 text-2xl font-semibold">Things to know</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {columns.map((col) => {
          const Icon = col.icon;
          return (
            <div key={col.title}>
              <Icon size={22} strokeWidth={1.5} className="mb-3 text-ink" aria-hidden />
              <h3 className="mb-3 font-medium text-ink">{col.title}</h3>
              <ul className="space-y-2 text-sm text-muted">
                {col.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <button
                onClick={() => toast.info("Coming soon")}
                className="mt-3 text-sm font-medium text-ink underline"
              >
                Learn more
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
