"use client";

import { Card, CardContent, Skeleton } from "@web/components/ui";
import { EmptyState, ErrorState } from "@web/components/ui";
import { CATEGORY_LABEL_MAP } from "@web/lib/category-ui";
import type { ProviderCard } from "@web/lib/api/types";
import { ProviderCard as ProviderCardComponent } from "./ProviderCard";

type Props = {
  items: ProviderCard[];
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
  limit: number;
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
};

export default function OfferersGrid({
  items,
  isLoading,
  error,
  isFetching,
  limit,
  favoriteIds,
  onToggleFavorite,
}: Props) {
  const errorMessage =
    error instanceof Error ? error.message : "Ачааллах үед алдаа гарлаа.";

  if (isLoading) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: limit }).map((_, index) => (
          <Card key={`provider-skeleton-${index}`} className="border-border/60">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4">
        <ErrorState
          title="Ачааллахад алдаа гарлаа"
          message={errorMessage}
          onRetry={() => {}}
          isRetrying={isFetching}
          retryLabel="Дахин оролдох"
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState
          title="Үйлчилгээ үзүүлэгч олдсонгүй"
          description="Ангилал эсвэл хайлтаа өөрчилж үзнэ үү."
        />
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((provider) => (
        <ProviderCardComponent
          key={provider.id}
          provider={provider}
          topCategoryLabel={
            provider.topCategory
              ? CATEGORY_LABEL_MAP.get(provider.topCategory) ||
                provider.topCategory
              : null
          }
          isFavorite={favoriteIds.includes(provider.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
