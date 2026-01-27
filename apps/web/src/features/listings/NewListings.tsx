"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ErrorState, SkeletonGrid } from "@web/components/ui";
import { useListings } from "@web/lib/hooks/useApi";
import ListingCard from "./ListingCard";

type NewListingsProps = {
  category?: string;
};


export default function NewListings({ category }: NewListingsProps) {
  const { data: listings = [], isLoading, error } = useListings(category);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (isLoading) {
    return (
      <section className="mx-auto mt-12 max-w-6xl px-4">
        <SkeletonGrid count={4} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto mt-12 max-w-6xl px-4">
        <ErrorState title="Алдаа гарлаа" message={(error as Error).message} />
      </section>
    );
  }

  return (
    <section className="mx-auto mt-12 max-w-6xl px-4">
      <h2 className="mb-4 text-2xl font-semibold">Шинэ зарууд</h2>

      <div className="relative">
        {canScrollPrev && (
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
            aria-label="Өмнөх"
          >
            ‹
          </button>
        )}

        <div className="overflow-hidden pb-2" ref={emblaRef}>
          <div className="flex gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="min-w-[80%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[22%]"
              >
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        </div>

        {canScrollNext && (
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
            aria-label="Дараах"
          >
            ›
          </button>
        )}
      </div>

      <div className="mt-4 text-right">
        <Link href="/listings" className="text-sm text-blue-600 hover:underline">
          Бүх заруудыг харах
        </Link>
      </div>
    </section>
  );
}
