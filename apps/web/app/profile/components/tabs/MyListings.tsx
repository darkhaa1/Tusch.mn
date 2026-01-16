'use client';

import { useCurrentUser, useMyListings } from '../../../hooks/useApi';
import ListingCard from '../../../listings/ListingCard';
import { SkeletonGrid, EmptyState, ErrorState } from '../../../../components/common';

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
          firstName: currentUser.firstName || currentUser.firstName || '',
          lastName: currentUser.lastName || currentUser.lastName || '',
          email: currentUser.email,
        }
        : undefined),
  }));

  if (isLoading) return <SkeletonGrid count={6} />;
  if (error)
    return (
      <ErrorState
        title="Алдаа гарлаа"
        message="Алдаа гарлаа"
      />
    );

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Одоогоор зар алга."
        description="Таны нийтэлсэн зар хараахан байхгүй байна."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {enriched.map((listing) => (
        <div key={listing.id} className="h-full">
          <ListingCard listing={listing} />
        </div>
      ))}
    </div>
  );
}
