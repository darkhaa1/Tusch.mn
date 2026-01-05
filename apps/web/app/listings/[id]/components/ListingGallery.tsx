"use client";

import { cn } from "../../../lib/utils";

type ListingGalleryProps = {
  heading: string;
  categoryLabel: string | null;
  imageUrls: string[];
  displayedMain: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function ListingGallery({
  heading,
  categoryLabel,
  imageUrls,
  displayedMain,
  selectedIndex,
  onSelect,
}: ListingGalleryProps) {
  return (
    <div className="overflow-hidden">
      <div className="relative">
        <div className="aspect-[4/3] w-full bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayedMain} alt={heading} className="h-full w-full object-cover" />
        </div>
        <div className="absolute bottom-3 left-3 flex gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
          <span>{categoryLabel || "Ангилалгүй"}</span>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto p-4">
        {[displayedMain, ...imageUrls.filter((_, idx) => idx !== selectedIndex)].slice(0, 4).map((url, idx) => {
          const originalIndex = imageUrls.indexOf(url);
          const active = originalIndex === selectedIndex;
          return (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => onSelect(originalIndex >= 0 ? originalIndex : 0)}
              className={cn(
                "relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border transition",
                active ? "ring-2 ring-primary" : "hover:border-primary/60"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={heading} className="h-full w-full object-cover" />
            </button>
          );
        })}
        {!imageUrls.length && <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border bg-muted" />}
      </div>
    </div>
  );
}
