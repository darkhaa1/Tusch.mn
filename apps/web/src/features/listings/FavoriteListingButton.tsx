"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCurrentUser,
  useFavoriteListingIds,
  useToggleFavoriteListing,
} from "@web/lib/hooks/useApi";
import { cn } from "@web/lib/utils";

type Props = {
  listingId: string;
};

export function FavoriteListingButton({ listingId }: Props) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: favoriteIds = [] } = useFavoriteListingIds();
  const toggle = useToggleFavoriteListing();

  const isFavorited = favoriteIds.includes(listingId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("tusch:fav-listing-intent", listingId);
      }
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
      return;
    }
    toggle.mutate({ listingId, isFavorited });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
        isFavorited && "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
      )}
      aria-label={isFavorited ? "Хадгалсанаас хасах" : "Хадгалах"}
      aria-pressed={isFavorited}
    >
      <Heart
        className={cn("h-4 w-4", isFavorited && "fill-current")}
        aria-hidden="true"
      />
    </button>
  );
}
