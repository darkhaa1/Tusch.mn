"use client";

import { useTranslations } from "next-intl";
import { EmptyState, ErrorState, ListingGrid } from "@web/components/common";
import { SkeletonGrid, buttonVariants } from "@web/components/ui";
import ListingCard from "../ListingCard";
import type { Listing } from "@web/lib/api/types";

type Props = {
  items: Listing[];
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
  hasSearch: boolean;
  limit: number;
  allListingsHref: string;
  onRefetch: () => void;
  onCreateListing: () => void;
};

export default function ListingsGrid({
  items,
  isLoading,
  error,
  isFetching,
  hasSearch,
  limit,
  allListingsHref,
  onRefetch,
  onCreateListing,
}: Props) {
  const t = useTranslations("listings.client");
  const tErrors = useTranslations("errors");

  const errorMessage =
    error instanceof Error ? error.message : tErrors("generic");

  if (isLoading) {
    return <SkeletonGrid count={limit} />;
  }

  if (error) {
    return (
      <ErrorState
        title={t("errorTitle")}
        message={errorMessage}
        onRetry={onRefetch}
        isRetrying={isFetching}
        retryLabel={t("retry")}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={hasSearch ? t("emptySearchTitle") : t("emptyTitle")}
        description={
          hasSearch ? t("emptySearchDescription") : t("emptyDescription")
        }
        secondaryHref={allListingsHref}
        secondaryLabel={t("seeAllListings")}
        primaryAction={
          <button
            type="button"
            onClick={onCreateListing}
            className={buttonVariants({ size: "sm" })}
          >
            {t("addListing")}
          </button>
        }
      />
    );
  }

  return (
    <ListingGrid>
      {items.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </ListingGrid>
  );
}
