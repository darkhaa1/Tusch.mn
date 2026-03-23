"use client";

import Link from "next/link";
import { Heart, MapPin, ShieldCheck, Star, Layers } from "lucide-react";
import { Avatar, Badge, Card, CardContent } from "@web/components/ui";
import resolveImageUrl from "@web/lib/resolveImageUrl";
import { ProviderCard as ProviderCardType } from "@web/lib/api/types";
import { cn } from "@web/lib/utils";

type ProviderCardProps = {
  provider: ProviderCardType;
  topCategoryLabel?: string | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function ProviderCard({
  provider,
  topCategoryLabel,
  isFavorite,
  onToggleFavorite,
}: ProviderCardProps) {
  const name = [provider.firstName, provider.lastName].filter(Boolean).join(" ") || "Offerers";
  const avatarUrl = resolveImageUrl(provider.avatarUrl || undefined) || undefined;
  const hasReviews = provider.reviewsCount > 0 && typeof provider.ratingAvg === "number";
  const ratingLabel = hasReviews ? provider.ratingAvg!.toFixed(1) : "Nouveau";
  const ratingCount = hasReviews ? `(${provider.reviewsCount})` : "";
  const categoryLabel = topCategoryLabel || provider.topCategory;

  return (
    <Link href={`/u/${provider.id}`} className="group block h-full">
      <Card className="relative h-full border-border/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavorite(provider.id);
          }}
          className={cn(
            "absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
            isFavorite && "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
          )}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={isFavorite}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} aria-hidden="true" />
        </button>
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <Avatar src={avatarUrl} alt={name} className="h-12 w-12" />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <p className="text-base font-semibold text-foreground transition group-hover:text-foreground group-hover:underline">
                  {name}
                </p>
                {provider.isVerified ? (
                  <ShieldCheck className="h-4 w-4 shrink-0 text-green-500" aria-label="Баталгаажсан" />
                ) : null}
              </div>
              {categoryLabel ? (
                <Badge variant="secondary" className="text-xs">
                  {categoryLabel}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {provider.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {provider.location}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Layers className="h-4 w-4" aria-hidden="true" />
              {provider.listingsCount} offres
            </span>
          </div>
          <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" aria-hidden="true" />
            <span className={cn("font-medium", hasReviews ? "text-foreground" : "text-muted-foreground")}>
              {ratingLabel}
            </span>
            <span className="text-xs text-muted-foreground">{ratingCount}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ProviderCard;

