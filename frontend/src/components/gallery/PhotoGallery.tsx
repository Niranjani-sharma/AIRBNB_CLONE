"use client";
import Image from "next/image";
import { useState } from "react";
import type { PhotoDTO } from "@/lib/types";

// Airbnb-style hero gallery: a large image on the left + a 2x2 grid on the
// right (side slots are padded by cycling available photos so the block always
// looks full), with a "Show all photos" button that opens every photo large.
export default function PhotoGallery({ photos, title }: { photos: PhotoDTO[]; title: string }) {
  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder);
  const [open, setOpen] = useState(false);
  if (sorted.length === 0) return null;

  const hero = sorted[0];
  const rest = sorted.slice(1);
  // Always render four side tiles; cycle through whatever photos exist.
  const side = Array.from({ length: 4 }, (_, i) =>
    rest.length ? rest[i % rest.length] : hero
  );

  return (
    <>
      <div className="relative grid h-[52vh] max-h-[520px] min-h-[340px] grid-cols-1 gap-2 overflow-hidden rounded-2xl md:grid-cols-2">
        <button
          onClick={() => setOpen(true)}
          className="group relative h-full w-full"
          aria-label="Open photo gallery"
        >
          <Image src={hero.url} alt={title} fill sizes="50vw" className="object-cover transition group-hover:brightness-90" priority />
        </button>

        <div className="hidden grid-cols-2 grid-rows-2 gap-2 md:grid">
          {side.map((p, i) => (
            <button
              key={i}
              onClick={() => setOpen(true)}
              className="group relative h-full w-full"
              aria-label={`Photo ${i + 2}`}
            >
              <Image src={p.url} alt={`${title} ${i + 2}`} fill sizes="25vw" className="object-cover transition group-hover:brightness-90" loading="lazy" />
            </button>
          ))}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-hof bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:scale-[1.02]"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
            <path d="M1 2h6v5H1V2zm8 0h6v5H9V2zM1 9h6v5H1V9zm8 0h6v5H9V9z" />
          </svg>
          Show all photos
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95" onClick={() => setOpen(false)}>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close gallery"
            className="fixed left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl leading-none hover:bg-white"
          >
            ×
          </button>
          <div className="mx-auto max-w-4xl space-y-4 px-4 py-16" onClick={(e) => e.stopPropagation()}>
            {sorted.map((p, i) => (
              <div key={p.id} className="relative aspect-[3/2] w-full overflow-hidden rounded-xl">
                <Image src={p.url} alt={`${title} ${i + 1}`} fill sizes="(max-width:896px) 100vw, 896px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
