"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterX, Plus, Search, ArrowLeft } from "lucide-react";
import NewListingModal from "./NewListingModal";
import ListingCard from "./ListingCard";
import { useListingsPage } from "../hooks/useApi";
import { getNumberParam, setSearchParams } from "../lib/query";
import { resolveCategoryLabel } from "./categoryLabels";
import { Badge, Button, Card, CardContent, Input, buttonVariants } from "@repo/ui";
import { cn } from "../lib/utils";
import AppShell from "../../components/layout/AppShell";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { SkeletonGrid } from "../../components/common/SkeletonGrid";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const DEFAULT_SORT = "newest";

const FEATURED_CATEGORIES = [
  { value: "cleaning", label: "Цэвэрлэгээ" },
  { value: "repair", label: "Засвар" },
  { value: "delivery", label: "Хүргэлт" },
  { value: "moving", label: "Нүүлгэлт" },
  { value: "tutoring", label: "Хичээл" },
  { value: "pets", label: "Тэжээвэр амьтан" },
  { value: "beauty", label: "Гоо сайхан" },
  { value: "other", label: "Бусад" },
];

const normalizeCategory = (value: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const category = normalizeCategory(searchParams.get("category"));
  const page = getNumberParam(searchParams, "page", DEFAULT_PAGE);
  const limit = getNumberParam(searchParams, "limit", DEFAULT_LIMIT);
  const sort = normalizeCategory(searchParams.get("sort")) || DEFAULT_SORT;

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

  const categoryLabel = useMemo(() => resolveCategoryLabel(category), [category]);
  const labelFinal = category ? categoryLabel || category : "";
  const showTotal = !isLoading && !error && totalKnown;
  const totalLabel = showTotal ? `${total} зар` : "";

  const updatePage = (nextPage: number) => {
    const query = setSearchParams(searchParams, {
      page: nextPage,
      limit,
      category,
      sort,
    });
    router.push(`/listings${query}`);
  };

  const handleSortChange = (nextSort: string) => {
    const query = setSearchParams(searchParams, {
      page: 1,
      limit,
      category,
      sort: nextSort,
    });
    router.push(`/listings${query}`);
  };

  const resetFilters = () => {
    const query = setSearchParams(searchParams, {
      page: 1,
      limit,
      sort,
      category: null,
    });
    router.push(`/listings${query}`);
  };

  const allListingsQuery = setSearchParams(new URLSearchParams(), {
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

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span>Категори</span>
          <button
            type="button"
            onClick={resetFilters}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
          >
            <FilterX className="h-4 w-4" aria-hidden="true" />
            Цэвэрлэх
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FEATURED_CATEGORIES.map((item) => {
            const active = category === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  const query = setSearchParams(searchParams, {
                    page: 1,
                    limit,
                    sort,
                    category: item.value,
                  });
                  router.push(`/listings${query}`);
                }}
                className={cn(
                  "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {!isLoading && !error ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => updatePage(resolvedPage - 1)}
            disabled={!hasPrevious || isFetching}
            className="min-w-[120px]"
          >
            Өмнөх
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="rounded-full border-border/80 px-3 py-1 text-xs font-medium">
              Page {resolvedPage}
            </Badge>
            <span>{totalKnown && totalPages > 0 ? `/ ${totalPages}` : ""}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => updatePage(resolvedPage + 1)}
            disabled={!hasNext || isFetching}
            className="min-w-[120px]"
          >
            Дараах
          </Button>
        </div>
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
