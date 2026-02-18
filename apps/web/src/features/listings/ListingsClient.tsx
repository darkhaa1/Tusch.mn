"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, DollarSign, FilterX, MapPin, Plus, Search, X } from "lucide-react";
import NewListingModal from "@web/features/listings/components/NewListingModal";
import FiltersBar from "@web/features/listings/components/FiltersBar";
import Pagination from "@web/features/listings/components/Pagination";
import ListingCard from "./ListingCard";
import { EmptyState, ErrorState, ListingGrid } from "@web/components/common";
import {
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  Select,
  SkeletonGrid,
  buttonVariants,
} from "@web/components/ui";
import AppShell from "@web/components/layout/AppShell";
import { useListingLocations, useListingsPage } from "@web/lib/hooks/useApi";
import { buildListingsQuery, parseListingsQuery } from "@web/lib/query";
import { resolveCategoryLabel } from "./categoryLabels";
import { cn } from "@web/lib/utils";
import { CATEGORY_OPTIONS } from "@web/lib/categories";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const DEFAULT_SORT = "newest";

export default function ListingsClient() {
  const t = useTranslations("listings.client");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { category, page, limit, sort, search, minPrice, maxPrice, location } =
    parseListingsQuery(searchParams, {
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
      sort: DEFAULT_SORT,
    });

  const [searchValue, setSearchValue] = useState(search ?? "");
  const [priceMinInput, setPriceMinInput] = useState(minPrice !== undefined ? String(minPrice) : "");
  const [priceMaxInput, setPriceMaxInput] = useState(maxPrice !== undefined ? String(maxPrice) : "");

  useEffect(() => {
    const handlePopState = () => {
      const nextSearchParams = new URLSearchParams(window.location.search);
      const nextQuery = parseListingsQuery(nextSearchParams, {
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
        sort: DEFAULT_SORT,
      });
      setSearchValue(nextQuery.search ?? "");
      setPriceMinInput(nextQuery.minPrice !== undefined ? String(nextQuery.minPrice) : "");
      setPriceMaxInput(nextQuery.maxPrice !== undefined ? String(nextQuery.maxPrice) : "");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = searchValue.trim();
      const currentSearch = search ?? "";
      if (trimmed === currentSearch) return;

      const query = buildListingsQuery(searchParams, {
        page: 1,
        limit,
        sort,
        category,
        search: trimmed.length ? trimmed : null,
        minPrice,
        maxPrice,
        location,
      });
      router.push(`/listings${query}`);
    }, 300);

    return () => clearTimeout(handle);
  }, [searchValue, search, category, limit, sort, minPrice, maxPrice, location, searchParams, router]);

  const { data: locations } = useListingLocations();

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
  const hasNext = totalKnown ? resolvedPage < totalPages : items.length === resolvedLimit;

  const categoryLabel = resolveCategoryLabel(category);
  const labelFinal = category ? categoryLabel || category : "";
  const showTotal = !isLoading && !error && totalKnown;
  const totalLabel = showTotal ? t("totalListings", { count: total }) : "";
  const hasSearch = Boolean(search);
  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined;
  const hasActiveFilters = Boolean(category || hasSearch || hasPriceFilter || location);

  const priceChipLabel = hasPriceFilter
    ? minPrice !== undefined && maxPrice !== undefined
      ? t("priceRangeCompact", {
          min: `${minPrice.toLocaleString()}€`,
          max: `${maxPrice.toLocaleString()}€`,
        })
      : minPrice !== undefined
        ? t("pricePlus", { value: `${minPrice.toLocaleString()}€` })
        : t("priceUpTo", { value: `${maxPrice!.toLocaleString()}€` })
    : "";

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

  const handleSortChange = (nextSort: string) => {
    const query = buildListingsQuery(searchParams, {
      page: 1,
      limit,
      category,
      sort: nextSort,
      search,
      minPrice,
      maxPrice,
      location,
    });
    router.push(`/listings${query}`);
  };

  const resetFilters = () => {
    setSearchValue("");
    setPriceMinInput("");
    setPriceMaxInput("");
    const query = buildListingsQuery(searchParams, {
      page: 1,
      limit,
      sort,
      category: null,
      search: null,
      minPrice: null,
      maxPrice: null,
      location: null,
    });
    router.push(`/listings${query}`);
  };

  const clearSearch = () => {
    setSearchValue("");
    const query = buildListingsQuery(searchParams, {
      page: 1,
      limit,
      sort,
      category,
      search: null,
      minPrice,
      maxPrice,
      location,
    });
    router.push(`/listings${query}`);
  };

  const clearCategory = () => {
    const query = buildListingsQuery(searchParams, {
      page: 1,
      limit,
      sort,
      category: null,
      search,
      minPrice,
      maxPrice,
      location,
    });
    router.push(`/listings${query}`);
  };

  const applyPriceFilter = () => {
    const min = priceMinInput.trim() ? Math.max(0, Math.floor(Number(priceMinInput))) : undefined;
    const max = priceMaxInput.trim() ? Math.max(0, Math.floor(Number(priceMaxInput))) : undefined;
    if (min !== undefined && max !== undefined && max < min) return;

    const query = buildListingsQuery(searchParams, {
      page: 1,
      limit,
      sort,
      category,
      search,
      minPrice: min ?? null,
      maxPrice: max ?? null,
      location,
    });
    router.push(`/listings${query}`);
  };

  const clearPriceFilter = () => {
    setPriceMinInput("");
    setPriceMaxInput("");
    const query = buildListingsQuery(searchParams, {
      page: 1,
      limit,
      sort,
      category,
      search,
      minPrice: null,
      maxPrice: null,
      location,
    });
    router.push(`/listings${query}`);
  };

  const handleLocationChange = (nextLocation: string) => {
    const query = buildListingsQuery(searchParams, {
      page: 1,
      limit,
      sort,
      category,
      search,
      minPrice,
      maxPrice,
      location: nextLocation || null,
    });
    router.push(`/listings${query}`);
  };

  const clearLocation = () => {
    const query = buildListingsQuery(searchParams, {
      page: 1,
      limit,
      sort,
      category,
      search,
      minPrice,
      maxPrice,
      location: null,
    });
    router.push(`/listings${query}`);
  };

  const allListingsQuery = buildListingsQuery(new URLSearchParams(), {
    page: 1,
    limit,
    sort,
  });
  const allListingsHref = `/listings${allListingsQuery}`;

  const errorMessage = error instanceof Error ? error.message : tErrors("generic");

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
          <Button type="button" className="gap-2" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("addListing")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/60 p-4 shadow-sm">
        <div className="relative">
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-10 pr-10"
            aria-label={t("searchAria")}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          {searchValue ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:text-foreground"
              aria-label={t("clearSearchAria")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("quickHint")}</span>
          {showTotal ? <span className="font-medium text-foreground">{totalLabel}</span> : null}
        </div>
      </div>

      <FiltersBar
        title={t("categoryTitle")}
        filters={
          hasActiveFilters ? (
            <>
              {category ? (
                <button
                  type="button"
                  onClick={clearCategory}
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                >
                  {labelFinal}
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ) : null}
              {hasSearch ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                >
                  {search}
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ) : null}
              {hasPriceFilter ? (
                <button
                  type="button"
                  onClick={clearPriceFilter}
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                >
                  {priceChipLabel}
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ) : null}
              {location ? (
                <button
                  type="button"
                  onClick={clearLocation}
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                >
                  {location}
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ) : null}
            </>
          ) : null
        }
        actions={
          <button
            type="button"
            onClick={resetFilters}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 ui-interactive")}
          >
            <FilterX className="h-4 w-4" aria-hidden="true" />
            {t("clearFilters")}
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-2 pb-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {CATEGORY_OPTIONS.map((item) => {
            const active = category === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  const query = buildListingsQuery(searchParams, {
                    page: 1,
                    limit,
                    sort,
                    category: item.value,
                    search,
                    minPrice,
                    maxPrice,
                    location,
                  });
                  router.push(`/listings${query}`);
                }}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-medium transition text-center leading-tight sm:text-sm ui-interactive",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-muted text-foreground hover:border-primary/60 hover:bg-muted/80"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </FiltersBar>

      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-2",
              hasPriceFilter && "border-primary text-primary"
            )}
          >
            <DollarSign className="h-4 w-4" aria-hidden="true" />
            {hasPriceFilter ? priceChipLabel : t("price")}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-4">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">{t("priceRange")}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={t("priceMinPlaceholder")}
                  min={0}
                  value={priceMinInput}
                  onChange={(e) => setPriceMinInput(e.target.value)}
                  className="h-9"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder={t("priceMaxPlaceholder")}
                  min={0}
                  value={priceMaxInput}
                  onChange={(e) => setPriceMaxInput(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={applyPriceFilter} className="flex-1">
                  {t("search")}
                </Button>
                {hasPriceFilter && (
                  <Button size="sm" variant="ghost" onClick={clearPriceFilter}>
                    {t("clearFilters")}
                  </Button>
                )}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Select
            value={location || ""}
            onChange={(e) => handleLocationChange(e.target.value)}
            className={cn("h-9 w-auto min-w-35", location && "border-primary text-primary")}
            aria-label={t("locationAria")}
          >
            <option value="">{t("allLocations")}</option>
            {(locations ?? []).map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="border border-border/80">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="sort-select">
              {t("sortLabel")}
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(event) => handleSortChange(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="newest">{t("sortNewest")}</option>
              <option value="oldest">{t("sortOldest")}</option>
            </select>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
              >
                <FilterX className="h-4 w-4" aria-hidden="true" />
                {t("clearFilterSet")}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <SkeletonGrid count={limit} />
      ) : error ? (
        <ErrorState
          title={t("errorTitle")}
          message={errorMessage}
          onRetry={() => refetch()}
          isRetrying={isFetching}
          retryLabel={t("retry")}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={hasSearch ? t("emptySearchTitle") : t("emptyTitle")}
          description={hasSearch ? t("emptySearchDescription") : t("emptyDescription")}
          secondaryHref={allListingsHref}
          secondaryLabel={t("seeAllListings")}
          primaryAction={
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className={buttonVariants({ size: "sm" })}
            >
              {t("addListing")}
            </button>
          }
        />
      ) : (
        <ListingGrid>
          {items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </ListingGrid>
      )}

      {!isLoading && !error ? (
        <Pagination
          page={resolvedPage}
          totalPages={totalKnown ? totalPages : undefined}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          isBusy={isFetching}
          onPageChange={updatePage}
          previousLabel={t("previous")}
          nextLabel={t("next")}
        />
      ) : null}
      <button
        type="button"
        onClick={() => setCreateModalOpen(true)}
        className={cn(
          buttonVariants(),
          "fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full p-0 shadow-md shadow-primary/30 sm:hidden"
        )}
        aria-label={t("floatingAddAria")}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>

      <NewListingModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </AppShell>
  );
}
