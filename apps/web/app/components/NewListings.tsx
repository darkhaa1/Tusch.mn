"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useListings } from "../hooks/useApi";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
};

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

  if (isLoading) return <p className="text-center py-10">⏳ Түр хүлээнэ үү...</p>;
  if (error)
    return (
      <p className="text-center text-red-500 py-10">
        ⚠️ Алдаа гарлаа: {(error as Error).message}
      </p>
    );

  return (
    <section className="max-w-6xl mx-auto px-4 mt-12">
      <h2 className="mb-4 text-2xl font-semibold">Шинэ зарууд</h2>

      <div className="relative">
        {canScrollPrev && (
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
            aria-label="Previous"
          >
            ←
          </button>
        )}

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="min-w-[80%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[22%] overflow-hidden rounded-lg border shadow-sm transition hover:shadow-md"
              >
                <img
                  src="/placeholder.jpg"
                  alt={listing.title}
                  className="h-36 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold">{listing.title}</h3>
                  <p className="line-clamp-2 text-sm text-gray-600">
                    {listing.description}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {listing.location ?? "Байршил тодорхойгүй"}
                  </p>
                  <p className="mt-1 text-sm text-blue-600">
                    {listing.price.toLocaleString()} ₮
                  </p>
                  <Link
                    href={`/listings/${listing.id}`}
                    className="mt-3 block w-full rounded bg-blue-600 py-1.5 text-center text-sm text-white"
                  >
                    Дэлгэрэнгүй
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {canScrollNext && (
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
            aria-label="Next"
          >
            →
          </button>
        )}
      </div>

      <div className="mt-4 text-right">
        <a href="/annonces" className="text-sm text-blue-600 hover:underline">
          Цааш →
        </a>
      </div>
    </section>
  );
}
