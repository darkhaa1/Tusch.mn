"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Badge, Button, Card, CardContent, EmptyState, ErrorState, Skeleton } from "@web/components/ui";
import type { Offer } from "@web/lib/api/types";
import { OfferCard } from "./OfferCard";

type OffersListProps = {
  items: Offer[];
  isLoading?: boolean;
  error?: unknown;
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onRetry?: () => void;
  showListing?: boolean;
  showProvider?: boolean;
  onAccept?: (offer: Offer) => Promise<void>;
  onReject?: (offer: Offer) => Promise<void>;
  onCancel?: (offer: Offer) => Promise<void>;
  onComplete?: (offer: Offer) => void;
  busyOfferId?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function OffersList({
  items,
  isLoading = false,
  error,
  page = 1,
  total = 0,
  limit = 12,
  onPageChange,
  onRetry,
  showListing = false,
  showProvider = false,
  onAccept,
  onReject,
  onCancel,
  onComplete,
  busyOfferId,
  emptyTitle,
  emptyDescription,
}: OffersListProps) {
  const t = useTranslations("offers");
  const totalPages = useMemo(() => {
    if (!limit || total <= 0) return 0;
    return Math.ceil(total / limit);
  }, [limit, total]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`offer-skeleton-${index}`} className="border border-border/80">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : t("errors.generic");
    return (
      <ErrorState
        title={t("errors.title")}
        message={message}
        onRetry={onRetry}
        retryLabel={t("actions.retry")}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title={emptyTitle || t("empty.title")}
        description={emptyDescription || t("empty.description")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {items.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            showListing={showListing}
            showProvider={showProvider}
            onAccept={onAccept}
            onReject={onReject}
            onCancel={onCancel}
            onComplete={onComplete}
            isBusy={busyOfferId === offer.id}
          />
        ))}
      </div>

      {onPageChange && totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="min-w-30"
          >
            {t("actions.previous")}
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="rounded-full border-border/80 px-3 py-1 text-xs font-medium">
              {t("pagination.page", { page })}
            </Badge>
            <span>{totalPages ? `/ ${totalPages}` : ""}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="min-w-30"
          >
            {t("actions.next")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default OffersList;