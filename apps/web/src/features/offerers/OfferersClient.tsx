"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Share2 } from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@web/components/ui";
import AppShell from "@web/components/layout/AppShell";
import {
  useProviders,
  useFavoriteProviderIds,
  useToggleFavoriteProvider,
} from "@web/lib/hooks/useApi";
import { getNumberParam, setSearchParams } from "@web/lib/query";
import { CATEGORY_LABEL_MAP } from "@web/lib/category-ui";
import OfferersFiltersBar from "./OfferersFiltersBar";
import OfferersGrid from "./OfferersGrid";
import OfferersPagination from "./OfferersPagination";
import {
  OfferersFavoritesSidebar,
  OfferersFavoritesSheet,
} from "./OfferersFavoritesPanel";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

const normalizeText = (value: string | null) => {
  if (!value) return "";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "";
};

export default function OfferersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  const qParam = normalizeText(searchParams.get("q"));
  const category = normalizeText(searchParams.get("category")) || undefined;
  const city = normalizeText(searchParams.get("city")) || undefined;
  const verifiedParam = searchParams.get("verified") === "true";
  const page = getNumberParam(searchParams, "page", DEFAULT_PAGE);
  const limit = getNumberParam(searchParams, "limit", DEFAULT_LIMIT);

  const { data, isLoading, error, isFetching } = useProviders({
    q: qParam || undefined,
    category,
    city,
    verified: verifiedParam || undefined,
    page,
    limit,
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const resolvedPage = data?.page ?? page;
  const resolvedLimit = data?.limit ?? limit;
  const totalPages =
    resolvedLimit > 0 ? Math.ceil(total / resolvedLimit) : 0;
  const hasPrevious = resolvedPage > 1;
  const hasNext = resolvedPage < totalPages;

  const categoryLabel = category
    ? CATEGORY_LABEL_MAP.get(category) || category
    : null;

  const totalLabel = error
    ? "Ачааллах боломжгүй"
    : isLoading
      ? "Ачааллаж байна..."
      : `${total} үйлчилгээ үзүүлэгч`;
  const titleLabel = categoryLabel || "Үйлчилгээ үзүүлэгчид";

  const { data: favoriteIds = [] } = useFavoriteProviderIds();
  const toggleMutation = useToggleFavoriteProvider();
  const toggleFavorite = useCallback(
    (id: string) => {
      const isFavorited = favoriteIds.includes(id);
      toggleMutation.mutate({ providerId: id, isFavorited });
    },
    [favoriteIds, toggleMutation],
  );

  const favoriteItems = useMemo(
    () => items.filter((item) => favoriteIds.includes(item.id)),
    [items, favoriteIds],
  );

  const updatePage = (nextPage: number) => {
    const query = setSearchParams(searchParams, {
      page: nextPage,
      limit,
      q: qParam || null,
      category: category || null,
    });
    router.push(`/offerers${query}`);
  };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-12">
        <OfferersFavoritesSidebar
          favoriteIds={favoriteIds}
          favoriteItems={favoriteItems}
        />

        <section className="lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                {titleLabel}
              </h1>
              <p className="text-sm text-muted-foreground">{totalLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <Sheet open={favoritesOpen} onOpenChange={setFavoritesOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 lg:hidden"
                  >
                    <Heart className="h-4 w-4" aria-hidden="true" />
                    Дуртай
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px]">
                  <SheetHeader>
                    <SheetTitle>Миний дуртай</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-6 pt-2">
                    <OfferersFavoritesSheet
                      favoriteIds={favoriteIds}
                      favoriteItems={favoriteItems}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Хуваалцах
              </Button>
            </div>
          </div>

          <OfferersFiltersBar />

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {titleLabel}
            </h2>
            <span className="text-sm text-muted-foreground">{totalLabel}</span>
          </div>

          <OfferersGrid
            items={items}
            isLoading={isLoading}
            error={error}
            isFetching={isFetching}
            limit={resolvedLimit}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />

          {!isLoading && !error ? (
            <OfferersPagination
              page={resolvedPage}
              totalPages={totalPages}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              isFetching={isFetching}
              onPageChange={updatePage}
            />
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
