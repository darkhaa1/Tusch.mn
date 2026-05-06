"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Plus } from "lucide-react";
import { Button, buttonVariants } from "@web/components/ui";
import AppShell from "@web/components/layout/AppShell";
import { useListingsPage } from "@web/lib/hooks/useListings";
import { buildListingsQuery, parseListingsQuery } from "@web/lib/query";
import { cn } from "@web/lib/utils";
import ListingsFiltersBar from "./components/ListingsFiltersBar";
import ListingsGrid from "./components/ListingsGrid";
import ListingsPagination from "./components/ListingsPagination";
import NewListingModal from "./components/NewListingModal";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const DEFAULT_SORT = "newest";

export default function ListingsClient() {
  const t = useTranslations("listings.client");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { category, page, limit, sort, search, minPrice, maxPrice, location } =
    parseListingsQuery(searchParams, {
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
      sort: DEFAULT_SORT,
    });

  const { data, isLoading, error, refetch, isFetching } = useListingsPage({
    category,
    page,
    limit,
    sort,
    search,
    minPrice,
    maxPrice,
    location,
  });

  const items = data?.items ?? [];
  const resolvedPage = data?.page ?? page;
  const resolvedLimit = data?.limit ?? limit;
  const totalKnown = typeof data?.total === "number" && data.total >= 0;
  const total = totalKnown ? data.total : 0;
  const totalPages =
    totalKnown && resolvedLimit > 0 ? Math.ceil(total / resolvedLimit) : 0;
  const hasPrevious = resolvedPage > 1;
  const hasNext = totalKnown
    ? resolvedPage < totalPages
    : items.length === resolvedLimit;

  const showTotal = !isLoading && !error && totalKnown;
  const totalLabel = showTotal ? t("totalListings", { count: total }) : "";
  const hasSearch = Boolean(search);

  const allListingsHref = `/listings${buildListingsQuery(new URLSearchParams(), { page: 1, limit, sort })}`;

  const updatePage = (nextPage: number) => {
    const query = buildListingsQuery(searchParams, {
      page: nextPage,
      limit,
      category,
      sort,
      search,
      minPrice,
      maxPrice,
      location,
    });
    router.push(`/listings${query}`);
  };

  return (
    <AppShell
      title={t("title")}
      description={totalLabel || t("description")}
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("back")}
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("addListing")}
          </Button>
        </div>
      }
    >
      <ListingsFiltersBar onCreateListing={() => setCreateModalOpen(true)} />

      <ListingsGrid
        items={items}
        isLoading={isLoading}
        error={error}
        isFetching={isFetching}
        hasSearch={hasSearch}
        limit={resolvedLimit}
        allListingsHref={allListingsHref}
        onRefetch={() => refetch()}
        onCreateListing={() => setCreateModalOpen(true)}
      />

      {!isLoading && !error ? (
        <ListingsPagination
          page={resolvedPage}
          totalPages={totalKnown ? totalPages : undefined}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          isBusy={isFetching}
          onPageChange={updatePage}
        />
      ) : null}

      <button
        type="button"
        onClick={() => setCreateModalOpen(true)}
        className={cn(
          buttonVariants(),
          "fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full p-0 shadow-md shadow-primary/30 sm:hidden",
        )}
        aria-label={t("floatingAddAria")}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>

      <NewListingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </AppShell>
  );
}
