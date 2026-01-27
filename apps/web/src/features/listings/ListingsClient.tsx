"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterX, Plus, Search, ArrowLeft } from "lucide-react";
import NewListingModal from "@web/features/listings/components/NewListingModal";
import FiltersBar from "@web/features/listings/components/FiltersBar";
import Pagination from "@web/features/listings/components/Pagination";
import ListingCard from "./ListingCard";
import { EmptyState, ErrorState, ListingGrid } from "@web/components/common";
import { SkeletonGrid } from "@web/components/ui";
import AppShell from "@web/components/layout/AppShell";
import { useListingsPage } from "@web/lib/hooks/useApi";
import { buildListingsQuery, parseListingsQuery } from "@web/lib/query";
import { resolveCategoryLabel } from "./categoryLabels";
import { Button, Card, CardContent, Input, buttonVariants } from "@web/components/ui";
import { cn } from "@web/lib/utils";
import { CATEGORY_OPTIONS } from "@web/lib/categories";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const DEFAULT_SORT = "newest";

export default function ListingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { category, page, limit, sort } = parseListingsQuery(searchParams, {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    sort: DEFAULT_SORT,
  });

  const { data, isLoading, error, refetch, isFetching } = useListingsPage({
    category,
    page,
    limit,
    sort,
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
  const totalLabel = showTotal ? `${total} зар` : "";

  const updatePage = (nextPage: number) => {
    const query = buildListingsQuery(searchParams, {
      page: nextPage,
      limit,
      category,
      sort,
    });
    router.push(`/listings${query}`);
  };

  const handleSortChange = (nextSort: string) => {
    const query = buildListingsQuery(searchParams, {
      page: 1,
      limit,
      category,
      sort: nextSort,
    });
    router.push(`/listings${query}`);
  };

  const resetFilters = () => {
    const query = buildListingsQuery(searchParams, {
      page: 1,
      limit,
      sort,
      category: null,
    });
    router.push(`/listings${query}`);
  };

  const allListingsQuery = buildListingsQuery(new URLSearchParams(), {
    page: 1,
    limit,
    sort,
  });
  const allListingsHref = `/listings${allListingsQuery}`;

  const errorMessage = error instanceof Error ? error.message : "Түр зуурын алдаа гарлаа.";

  return (
    <AppShell
      title="Зарууд"
      description={totalLabel || "Шинэ заруудыг үзэж, хүссэн үйлчилгээгээ хайна уу."}
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
            Буцах
          </Button>
          <Button type="button" className="gap-2" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Зар нэмэх
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/60 p-4 shadow-sm">
        <div className="relative">
          <Input
            placeholder="Юу хэрэгтэй байна? (жиш: засвар, цэвэрлэгээ)"
            className="pl-10"
            aria-label="Хайлт"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Илүү хурдан олоход тань тусална.</span>
          {showTotal ? <span className="font-medium text-foreground">{totalLabel}</span> : null}
        </div>
      </div>

      <FiltersBar
        title="Категори"
        actions={
          <button
            type="button"
            onClick={resetFilters}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 ui-interactive")}
          >
            <FilterX className="h-4 w-4" aria-hidden="true" />
            Цэвэрлэх
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

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Түргэн шүүлтүүр</span>
        {["Ойрхон", "Яаралтай", "₮ Төсөв"].map((label) => (
          <button
            key={label}
            type="button"
            disabled
            className="cursor-not-allowed rounded-full border border-dashed border-border/80 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            title="Тун удахгүй"
          >
            {label}
          </button>
        ))}
      </div>

      {category ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          Ангилал: {labelFinal}
        </span>
      ) : null}

      <Card className="border border-border/80">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="sort-select">
              Эрэмбэлэх
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(event) => handleSortChange(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="newest">Шинэ эхэнд</option>
              <option value="oldest">Хуучин эхэнд</option>
            </select>

            {category ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                {labelFinal}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
            >
              <FilterX className="h-4 w-4" aria-hidden="true" />
              Шүүлтүүр цэвэрлэх
            </button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <SkeletonGrid count={limit} />
      ) : error ? (
        <ErrorState
          title="Ачааллахад алдаа гарлаа"
          message={errorMessage}
          onRetry={() => refetch()}
          isRetrying={isFetching}
          retryLabel="Дахин ачаалах"
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Илэрц олдсонгүй"
          description="Таны хайсан ангилалд одоогоор зар алга байна. Бүх заруудыг үзэх эсвэл шинэ зар нэмнэ үү."
          secondaryHref={allListingsHref}
          secondaryLabel="Бүх заруудыг харах"
          primaryAction={
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className={buttonVariants({ size: "sm" })}
            >
              Зар нэмэх
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
          previousLabel="Өмнөх"
          nextLabel="Дараах"
        />
      ) : null}
      <button
        type="button"
        onClick={() => setCreateModalOpen(true)}
        className={cn(
          buttonVariants(),
          "fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full p-0 shadow-md shadow-primary/30 sm:hidden"
        )}
        aria-label="Зар нэмэх"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>

      <NewListingModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </AppShell>
  );
}



