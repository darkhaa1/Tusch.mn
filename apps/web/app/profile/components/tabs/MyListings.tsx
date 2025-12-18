'use client';

import { useCurrentUser, useMyListings } from '../../../hooks/useApi';
import ListingCard from '../../../listings/ListingCard';

export default function MyListings() {
  const { data, isLoading, error } = useMyListings();
  const { data: currentUser } = useCurrentUser();

  const enriched = (data || []).map((listing) => ({
    ...listing,
    user:
      listing.user ||
      (currentUser
        ? {
          id: currentUser.id,
          firstName: currentUser.firstName || currentUser.firstname || '',
          lastName: currentUser.lastName || currentUser.lastname || '',
          email: currentUser.email,
        }
        : undefined),
  }));

  if (isLoading) return <p>Түр хүлээнэ үү...</p>;
  if (error) return <p className="text-red-500">Алдаа гарлаа</p>;

  if (!data || data.length === 0) {
    return <p>Таны зарууд олдсонгүй.</p>;
  }

  return (
    <div className="space-y-4">
      {enriched.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
