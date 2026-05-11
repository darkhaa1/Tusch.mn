"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useListings } from "@web/lib/hooks/useApi";
import ListingCard from "./ListingCard";

type NewListingsProps = {
  category?: string;
};

const labels = {
  heading: "Шинэ зарууд",
  seeAll: "Бүх заруудыг харах",
  prev: "Өмнөх",
  next: "Дараах",
  loading: "Уншиж байна…",
  errorTitle: "Алдаа гарлаа",
};

export default function NewListings({ category }: NewListingsProps) {
  const { data: listings = [], isLoading, error } = useListings(category);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

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
      <section
        className="mx-auto mt-12 max-w-6xl px-5"
        style={{ color: "var(--at-ink)" }}
      >
        <div
          style={{
            fontFamily: "var(--at-mono)",
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--at-muted)",
          }}
        >
          {labels.loading}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="mx-auto mt-12 max-w-6xl px-5"
        style={{ color: "var(--at-ink)" }}
      >
        <div
          style={{
            fontFamily: "var(--at-serif)",
            fontSize: 22,
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          {labels.errorTitle}
        </div>
        <div style={{ fontSize: 13, color: "var(--at-muted)" }}>
          {(error as Error).message}
        </div>
      </section>
    );
  }

  return (
    <section
      className="mx-auto mt-12 max-w-6xl px-5"
      style={{ color: "var(--at-ink)" }}
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h2
          style={{
            fontFamily: "var(--at-serif)",
            fontSize: 28,
            fontWeight: 500,
            margin: 0,
            letterSpacing: "-0.02em",
            color: "var(--at-ink)",
          }}
        >
          {labels.heading}
        </h2>
        <Link
          href="/listings"
          style={{
            fontFamily: "var(--at-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--at-terre)",
            textDecoration: "none",
          }}
        >
          {labels.seeAll} →
        </Link>
      </div>

      <div className="relative">
        {canScrollPrev && (
          <button
            type="button"
            onClick={scrollPrev}
            aria-label={labels.prev}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2"
            style={{
              fontFamily: "var(--at-mono)",
              padding: "6px 10px",
              background: "var(--at-paper)",
              border: "1px solid var(--at-line)",
              color: "var(--at-ink)",
              cursor: "pointer",
            }}
          >
            ←
          </button>
        )}

        <div className="overflow-hidden pb-2" ref={emblaRef}>
          <div className="flex gap-4">
            {listings.map((listing, index) => (
              <div
                key={listing.id}
                className="min-w-[85%] sm:min-w-[60%] md:min-w-[48%] lg:min-w-[48%]"
              >
                <ListingCard listing={listing} priority={index === 0} />
              </div>
            ))}
          </div>
        </div>

        {canScrollNext && (
          <button
            type="button"
            onClick={scrollNext}
            aria-label={labels.next}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2"
            style={{
              fontFamily: "var(--at-mono)",
              padding: "6px 10px",
              background: "var(--at-paper)",
              border: "1px solid var(--at-line)",
              color: "var(--at-ink)",
              cursor: "pointer",
            }}
          >
            →
          </button>
        )}
      </div>
    </section>
  );
}
