import Image from "next/image";
import type { Photo } from "@/lib/types";

// "Where you'll sleep" — one card per bedroom (Airbnb detail pattern). Bedroom
// images cycle through the listing's photos; bed counts are derived from the
// listing's beds/bedrooms.
export default function WhereYouSleep({
  bedrooms,
  beds,
  photos,
}: {
  bedrooms: number;
  beds: number;
  photos: Photo[];
}) {
  if (bedrooms < 1) return null;
  const perRoom = Math.max(1, Math.round(beds / bedrooms));
  const bedText = perRoom > 1 ? `${perRoom} beds` : "1 double bed";

  return (
    <section className="border-b border-line py-8">
      <h2 className="mb-5 text-xl font-semibold">Where you&apos;ll sleep</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: bedrooms }).map((_, i) => {
          const photo = photos.length ? photos[(i + 1) % photos.length] : null;
          return (
            <div key={i}>
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-bg-soft">
                {photo && (
                  <Image src={photo.url} alt={`Bedroom ${i + 1}`} fill sizes="33vw" className="object-cover" />
                )}
              </div>
              <p className="font-medium text-ink">Bedroom {i + 1}</p>
              <p className="text-sm text-muted">{bedText}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
