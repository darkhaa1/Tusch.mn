'use client';

import { useMyListings } from '../../../hooks/useApi';

export default function MyListings() {
  const { data, isLoading, error } = useMyListings();

  if (isLoading) return <p>Түр хүлээнэ үү...</p>;
  if (error) return <p className="text-red-500">Алдаа гарлаа</p>;

  if (!data || data.length === 0) {
    return <p>Таны зар оруулаагүй байна.</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((listing) => (
        <div key={listing.id} className="border p-4 rounded shadow">
          <h3 className="font-bold text-lg">{listing.title}</h3>
          <p className="text-sm text-gray-700">{listing.description}</p>
          <p className="text-sm text-gray-500">{listing.location}</p>
        </div>
      ))}
    </div>
  );
}
