"use client";

import { Suspense, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, Layers, Star } from "lucide-react";
import Link from "next/link";
import AppShell from "@web/components/layout/AppShell";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
} from "@web/components/ui";
import {
  useCurrentUser,
  useFavoriteListings,
  useFavoriteProviders,
  useToggleFavoriteListing,
  useToggleFavoriteProvider,
} from "@web/lib/hooks/useApi";
import ListingCard from "@web/features/listings/ListingCard";
import { resolveCategoryLabel } from "@web/features/listings/categoryLabels";
import { CATEGORY_LABEL_MAP } from "@web/lib/categories";
import resolveImageUrl from "@web/lib/resolveImageUrl";
import { cn } from "@web/lib/utils";

type Tab = "listings" | "providers";

function FavoritesContent() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("listings");

  const { data: listingsData, isLoading: listingsLoading } = useFavoriteListings({ limit: 24 });
  const { data: providersData, isLoading: providersLoading } = useFavoriteProviders({ limit: 24 });

  const toggleListing = useToggleFavoriteListing();
  const toggleProvider = useToggleFavoriteProvider();

  const listings = useMemo(() => listingsData?.items ?? [], [listingsData]);
  const providers = useMemo(() => providersData?.items ?? [], [providersData]);

  const handleRemoveListing = useCallback(
    (listingId: string) => {
      toggleListing.mutate({ listingId, isFavorited: true });
    },
    [toggleListing],
  );

  const handleRemoveProvider = useCallback(
    (providerId: string) => {
      toggleProvider.mutate({ providerId, isFavorited: true });
    },
    [toggleProvider],
  );

  if (userLoading) {
    return (
      <AppShell title="Миний дуртай">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (!user) {
    router.push("/login?redirect=/dashboard/favorites");
    return null;
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "listings", label: "Зар", count: listingsData?.total ?? 0 },
    { key: "providers", label: "Үйлчилгээ үзүүлэгч", count: providersData?.total ?? 0 },
  ];

  return (
    <AppShell
      title="Миний дуртай"
      description="Хадгалсан зар болон үйлчилгээ үзүүлэгчид"
    >
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            <Badge
              variant={tab === key ? "default" : "outline"}
              className="rounded-full px-2 py-0.5 text-xs"
            >
              {count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Listings tab */}
      {tab === "listings" && (
        <>
          {listingsLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="mt-12 flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Heart className="h-7 w-7 text-rose-400" aria-hidden="true" />
              </div>
              <p className="text-base font-medium text-foreground">Хадгалсан зар байхгүй</p>
              <p className="text-sm text-muted-foreground">
                Зарын дэлгэрэнгүй хуудсанд зүрхний тэмдэгт дарж хадгалаарай.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/listings">Зар үзэх</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <div key={listing.id} className="relative">
                  <ListingCard listing={listing} />
                  <button
                    type="button"
                    onClick={() => handleRemoveListing(listing.id)}
                    className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                    aria-label="Хадгалсанаас хасах"
                  >
                    <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Providers tab */}
      {tab === "providers" && (
        <>
          {providersLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-36 w-full rounded-xl" />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="mt-12 flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Heart className="h-7 w-7 text-rose-400" aria-hidden="true" />
              </div>
              <p className="text-base font-medium text-foreground">Хадгалсан үйлчилгээ үзүүлэгч байхгүй</p>
              <p className="text-sm text-muted-foreground">
                Үйлчилгээ үзүүлэгчийн хуудсанд зүрхний тэмдэгт дарж хадгалаарай.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/offerers">Үйлчилгээ үзүүлэгч үзэх</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => {
                const name =
                  [provider.firstName, provider.lastName].filter(Boolean).join(" ") ||
                  "Үйлчилгээ үзүүлэгч";
                const avatarUrl =
                  resolveImageUrl(provider.avatarUrl || undefined) || undefined;
                const hasReviews =
                  provider.reviewsCount > 0 && typeof provider.ratingAvg === "number";
                const ratingLabel = hasReviews ? provider.ratingAvg!.toFixed(1) : "Шинэ";
                const categoryLabel = provider.topCategory
                  ? CATEGORY_LABEL_MAP.get(provider.topCategory) ||
                    resolveCategoryLabel(provider.topCategory)
                  : null;

                return (
                  <Card
                    key={provider.id}
                    className="relative border-border/70 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveProvider(provider.id)}
                      className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                      aria-label="Хадгалсанаас хасах"
                    >
                      <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
                    </button>
                    <CardContent className="flex flex-col gap-4 p-5">
                      <Link href={`/u/${provider.id}`} className="group flex items-start gap-3">
                        <Avatar src={avatarUrl} alt={name} className="h-12 w-12" />
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-foreground group-hover:underline">
                            {name}
                          </p>
                          {categoryLabel ? (
                            <Badge variant="secondary" className="text-xs">
                              {categoryLabel}
                            </Badge>
                          ) : null}
                        </div>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Layers className="h-4 w-4" aria-hidden="true" />
                          {provider.listingsCount} зар
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Star
                            className="h-4 w-4 fill-amber-400 stroke-amber-400"
                            aria-hidden="true"
                          />
                          <span className={cn("font-medium", hasReviews ? "text-foreground" : "")}>
                            {ratingLabel}
                          </span>
                          {hasReviews ? (
                            <span>({provider.reviewsCount})</span>
                          ) : null}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense>
      <FavoritesContent />
    </Suspense>
  );
}
