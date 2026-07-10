import ListingCard from "@/components/cards/ListingCard";
import type { ListingCardDTO } from "@/lib/types";

export default function ListingGrid({ listings }: { listings: ListingCardDTO[] }) {
  if (!listings.length) {
    return (
      <div className="py-24 text-center text-foggy">
        <p className="text-lg font-medium text-hof">No stays match your search</p>
        <p className="mt-1">Try adjusting your dates or filters.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 py-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
