"use client";

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function NewListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⬇️ IMPORTANT : loop: false pour avoir un vrai début/fin
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // ⬇️ Met à jour canScrollPrev / canScrollNext à chaque mouvement
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on("select", onSelect);
    onSelect(); // appel initial

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    async function loadListings() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erreur de chargement des annonces");
        const data = await res.json();
        setListings(data.data || data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  if (loading) return <p className="text-center py-10">⏳ Түр хүлээнэ үү...</p>;
  if (error)
    return (
      <p className="text-center text-red-500 py-10">
        ⚠️ Алдаа гарлаа: {error}
      </p>
    );

  return (
    <section className="max-w-6xl mx-auto px-4 mt-12">
      <h2 className="mb-4 text-2xl font-semibold">Шинэ зарууд</h2>

      <div className="relative">
        {/* ⬅️ Flèche gauche : s’affiche seulement si on PEUT revenir en arrière */}
        {canScrollPrev && (
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
            aria-label="Previous"
          >
            ←
          </button>
        )}

        {/* Zone carousel */}
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
                  <button className="mt-3 w-full rounded bg-blue-600 py-1.5 text-sm text-white">
                    Дэлгэрэнгүй
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ➡️ Flèche droite : s’affiche seulement s’il reste des cartes à droite */}
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
