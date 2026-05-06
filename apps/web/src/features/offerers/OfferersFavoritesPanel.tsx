"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { Badge, Avatar } from "@web/components/ui";
import { resolveImageUrl } from "@web/lib/image";
import type { ProviderCard } from "@web/lib/api/types";

type Props = {
  favoriteIds: string[];
  favoriteItems: ProviderCard[];
};

function FavoritesList({
  favoriteIds,
  favoriteItems,
}: {
  favoriteIds: string[];
  favoriteItems: ProviderCard[];
}) {
  if (favoriteItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/30 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
          <Heart className="h-5 w-5 text-rose-500" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Дуртай зүйл алга</p>
          <p className="text-xs text-muted-foreground">
            Үйлчилгээ үзүүлэгчдийг дуртайд нэмээд эндээс олно уу.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {favoriteItems.map((provider) => {
        const ratingLabel =
          provider.reviewsCount > 0 && typeof provider.ratingAvg === "number"
            ? provider.ratingAvg.toFixed(1)
            : "Шинэ";
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
                {[provider.firstName, provider.lastName].filter(Boolean).join(" ") ||
                  "Үйлчилгээ үзүүлэгч"}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star
                  className="h-3 w-3 fill-amber-400 stroke-amber-400"
                  aria-hidden="true"
                />
                {ratingLabel}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Үзэх</span>
          </Link>
        );
      })}
      {favoriteIds.length > favoriteItems.length ? (
        <p className="text-xs text-muted-foreground">
          Зарим дуртай нь энэ хуудсанд харагдахгүй байна.
        </p>
      ) : null}
    </div>
  );
}

export function OfferersFavoritesSidebar({ favoriteIds, favoriteItems }: Props) {
  return (
    <aside className="hidden lg:col-span-4 lg:block">
      <div className="rounded-xl border border-border/80 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Миний дуртай</p>
            <p className="text-xs text-muted-foreground">
              {favoriteIds.length} хадгалсан
            </p>
          </div>
          <Badge variant="outline" className="rounded-full px-3 text-xs">
            {favoriteIds.length}
          </Badge>
        </div>
        <FavoritesList favoriteIds={favoriteIds} favoriteItems={favoriteItems} />
      </div>
    </aside>
  );
}

export function OfferersFavoritesSheet({ favoriteIds, favoriteItems }: Props) {
  return (
    <FavoritesList favoriteIds={favoriteIds} favoriteItems={favoriteItems} />
  );
}
