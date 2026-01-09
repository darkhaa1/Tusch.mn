"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Share2,
  Heart,
  FilterX,
  Star,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Avatar,
} from "@repo/ui";
import AppShell from "../../components/layout/AppShell";
import { CATEGORY_LABEL_MAP, CATEGORY_OPTIONS } from "../lib/categories";
import { useProviders } from "../hooks/useApi";
import { getNumberParam, setSearchParams } from "../lib/query";
import { cn } from "../lib/utils";
import { ProviderCard } from "./ProviderCard";
import { useFavProviders } from "../hooks/useFavProviders";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import resolveImageUrl from "../lib/resolveImageUrl";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

const normalizeText = (value: string | null) => {
  if (!value) return "";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "";
};

export default function OffreursPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  const qParam = normalizeText(searchParams.get("q"));
  const [searchValue, setSearchValue] = useState(qParam);
  const debouncedSearch = useDebouncedValue(searchValue, 300);

  useEffect(() => {
    setSearchValue(qParam);
  }, [qParam]);

  const category = normalizeText(searchParams.get("category")) || undefined;
  const page = getNumberParam(searchParams, "page", DEFAULT_PAGE);
  const limit = getNumberParam(searchParams, "limit", DEFAULT_LIMIT);

  useEffect(() => {
    const nextQ = debouncedSearch.trim();
    if (nextQ === qParam) return;
    const query = setSearchParams(searchParams, {
      q: nextQ || null,
      page: 1,
    });
    router.push(`/offerers${query}`);
  }, [debouncedSearch, qParam, router, searchParams]);

  const { data, isLoading, error, refetch, isFetching } = useProviders({
    q: qParam || undefined,
    category,
    page,
    limit,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const resolvedPage = data?.page ?? page;
  const resolvedLimit = data?.limit ?? limit;
  const totalPages = resolvedLimit > 0 ? Math.ceil(total / resolvedLimit) : 0;
  const hasPrevious = resolvedPage > 1;
  const hasNext = resolvedPage < totalPages;

  const categoryLabel = category
    ? CATEGORY_LABEL_MAP.get(category) || category
    : null;

  const totalLabel = error
    ? "Impossible de charger"
    : isLoading
      ? "Chargement..."
      : `${total} offreurs`;
  const titleLabel = categoryLabel || "Үйлчилгээ үзүүлэгчид";

  const { ids: favoriteIds, add, remove, has } = useFavProviders();
  const toggleFavorite = useCallback(
    (id: string) => {
      if (has(id)) {
        remove(id);
      } else {
        add(id);
      }
    },
    [add, has, remove]
  );

  const favoriteItems = useMemo(
    () => items.filter((item) => favoriteIds.includes(item.id)),
    [items, favoriteIds]
  );

  const updatePage = (nextPage: number) => {
    const query = setSearchParams(searchParams, {
      page: nextPage,
      limit,
      q: qParam || null,
      category: category || null,
    });
    router.push(`/offreurs${query}`);
  };

  const updateCategory = (nextCategory?: string | null) => {
    const query = setSearchParams(searchParams, {
      page: 1,
      limit,
      q: qParam || null,
      category: nextCategory || null,
    });
    router.push(`/offreurs${query}`);
  };

  const resetFilters = () => {
    const query = setSearchParams(searchParams, {
      page: 1,
      limit,
      q: null,
      category: null,
    });
    router.push(`/offreurs${query}`);
  };

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Une erreur est survenue pendant le chargement.";

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="hidden lg:col-span-4 lg:block">
          <Card className="border-border/80">
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Mes favoris
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {favoriteIds.length} enregistres
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full px-3 text-xs">
                  {favoriteIds.length}
                </Badge>
              </div>

              {favoriteItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/30 p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                    <Heart className="h-5 w-5 text-rose-500" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Aucun favori
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enregistrez des offreurs pour les retrouver ici.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {favoriteItems.map((provider) => {
                    const ratingLabel =
                      provider.reviewsCount > 0 && typeof provider.ratingAvg === "number"
                        ? provider.ratingAvg.toFixed(1)
                        : "Nouveau";
                    const avatarUrl =
                      resolveImageUrl(provider.avatarUrl || undefined) || undefined;
                    return (
                      <Link
                        key={provider.id}
                        href={`/u/${provider.id}`}
                        className="group flex items-center gap-3 rounded-lg border border-border/70 bg-background px-3 py-2 transition hover:bg-muted/70"
                      >
                        <Avatar src={avatarUrl} alt={provider.firstName} className="h-9 w-9" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground transition group-hover:underline">
                            {[provider.firstName, provider.lastName]
                              .filter(Boolean)
                              .join(" ") || "Offreur"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" aria-hidden="true" />
                            {ratingLabel}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">Voir</span>
                      </Link>
                    );
                  })}
                  {favoriteIds.length > favoriteItems.length ? (
                    <p className="text-xs text-muted-foreground">
                      Certains favoris sont hors de cette page.
                    </p>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

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
                    Favoris
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px]">
                  <SheetHeader>
                    <SheetTitle>Mes favoris</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-6 pt-2">
                    {favoriteItems.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/30 p-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                          <Heart className="h-5 w-5 text-rose-500" aria-hidden="true" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Aucun favori
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Enregistrez des offreurs pour les retrouver ici.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {favoriteItems.map((provider) => {
                          const ratingLabel =
                            provider.reviewsCount > 0 && typeof provider.ratingAvg === "number"
                              ? provider.ratingAvg.toFixed(1)
                              : "Nouveau";
                          const avatarUrl =
                            resolveImageUrl(provider.avatarUrl || undefined) || undefined;
                          return (
                            <Link
                              key={provider.id}
                              href={`/u/${provider.id}`}
                              className="group flex items-center gap-3 rounded-lg border border-border/70 bg-background px-3 py-2 transition hover:bg-muted/70"
                            >
                              <Avatar src={avatarUrl} alt={provider.firstName} className="h-9 w-9" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground transition group-hover:underline">
                                  {[provider.firstName, provider.lastName]
                                    .filter(Boolean)
                                    .join(" ") || "Offreur"}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star
                                    className="h-3 w-3 fill-amber-400 stroke-amber-400"
                                    aria-hidden="true"
                                  />
                                  {ratingLabel}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Voir
                              </span>
                            </Link>
                          );
                        })}
                        {favoriteIds.length > favoriteItems.length ? (
                          <p className="text-xs text-muted-foreground">
                            Certains favoris sont hors de cette page.
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              <Button type="button" variant="secondary" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Хуваалцах
              </Button>
            </div>
          </div>

          <Card className="mt-6 border-border/80">
            <CardContent className="space-y-3 p-4">
              <div className="grid gap-3 md:grid-cols-[1.5fr_1fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Үйлчилгээ эсвэл нэрээр хайх"
                    className="pl-10"
                    aria-label="Rechercher"
                  />
                </div>
                <div className="relative hidden md:block">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Байршил"
                    className="pl-10"
                    aria-label="Localisation"
                    disabled
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Илүү нарийвчилсан үр дүн авахын тулд үйлчилгээний төрөлөөр шүүлтүүрдээрэй.</span>
                {(qParam || category) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-xs text-foreground transition hover:bg-muted/70",
                      "ui-interactive"
                    )}
                  >
                    <FilterX className="h-3 w-3" aria-hidden="true" />
                    Reinitialiser
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Categories
            </p>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => updateCategory(null)}
              className={cn(
                "flex min-w-[120px] items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition",
                !category
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-muted text-foreground hover:bg-muted/70"
              )}
            >
              <span>Tous</span>
            </button>
            {CATEGORY_OPTIONS.map((item) => {
              const Icon = item.icon;
              const active = category === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => updateCategory(item.value)}
                  className={cn(
                    "flex min-w-[160px] items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-muted text-foreground hover:bg-muted/70"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {titleLabel}
            </h2>
            <span className="text-sm text-muted-foreground">{totalLabel}</span>
          </div>

          {isLoading ? (
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
          ) : error ? (
            <div className="mt-4">
              <ErrorState
                title="Erreur de chargement"
                message={errorMessage}
                onRetry={() => refetch()}
                isRetrying={isFetching}
                retryLabel="Reessayer"
              />
            </div>
          ) : items.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Aucun offreur trouve"
                description="Essayez de changer la categorie ou la recherche."
              />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  topCategoryLabel={
                    provider.topCategory
                      ? CATEGORY_LABEL_MAP.get(provider.topCategory) || provider.topCategory
                      : null
                  }
                  isFavorite={has(provider.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}

          {!isLoading && !error && totalPages > 1 ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updatePage(resolvedPage - 1)}
                disabled={!hasPrevious || isFetching}
                className="min-w-[120px]"
              >
                Precedent
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="rounded-full border-border/80 px-3 py-1 text-xs font-medium">
                  Page {resolvedPage}
                </Badge>
                <span>{totalPages ? `/ ${totalPages}` : ""}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updatePage(resolvedPage + 1)}
                disabled={!hasNext || isFetching}
                className="min-w-[120px]"
              >
                Suivant
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
