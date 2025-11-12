"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    async function loadListings() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erreur de chargement des annonces");
        const data = await res.json();
        setListings(data.data);
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
      <h2 className="text-2xl font-semibold mb-4">Шинэ зарууд</h2>
      {listings.length === 0 ? (
        <p>Одоогоор зар байхгүй байна.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <img
                src="/placeholder.jpg" // tu peux changer si tu as un champ image plus tard
                alt={listing.title}
                className="w-full h-36 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold">{listing.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {listing.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {listing.location ?? "Байршил тодорхойгүй"}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {listing.price.toLocaleString()} ₮
                </p>
                <button className="mt-3 w-full bg-blue-600 text-white text-sm py-1.5 rounded">
                  Дэлгэрэнгүй
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="text-right mt-4">
        <a href="/annonces" className="text-blue-600 text-sm hover:underline">
          Цааш →
        </a>
      </div>
    </section>
  );
}
