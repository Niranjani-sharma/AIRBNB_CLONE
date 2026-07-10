// "Things to know" three-column block (Airbnb detail-page pattern). Content is
// generic/mocked house rules & safety info — original placeholder copy.
export default function ThingsToKnow({ maxGuests }: { maxGuests: number }) {
  const columns: { title: string; items: string[] }[] = [
    {
      title: "House rules",
      items: ["Check-in after 2:00 PM", "Checkout before 11:00 AM", `${maxGuests} guests maximum`],
    },
    {
      title: "Safety & property",
      items: ["Smoke alarm", "Carbon monoxide alarm", "Exterior security cameras on property"],
    },
    {
      title: "Cancellation policy",
      items: [
        "Free cancellation before check-in",
        "Review the host's full policy for details",
        "You won't be charged until you reserve",
      ],
    },
  ];

  return (
    <section className="border-t border-border py-8">
      <h2 className="mb-5 text-xl font-semibold">Things to know</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 font-medium text-hof">{col.title}</h3>
            <ul className="space-y-2 text-sm text-foggy">
              {col.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
