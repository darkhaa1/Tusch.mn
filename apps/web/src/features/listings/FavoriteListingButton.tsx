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
  /**
   * "md" (default) renders the original absolute-positioned circular button.
   * "sm" renders an inline tiny heart icon used in the Atelier listing rows.
   */
  size?: "sm" | "md";
};

const labels = {
  add: "Хадгалах",
  remove: "Хадгалсанаас хасах",
};

export function FavoriteListingButton({ listingId, size = "md" }: Props) {
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

  if (size === "sm") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center"
        style={{
          width: 18,
          height: 18,
          background: "transparent",
          border: "none",
          color: "var(--at-ink)",
          padding: 0,
        }}
        aria-label={isFavorited ? labels.remove : labels.add}
        aria-pressed={isFavorited}
      >
        <Heart
          className={cn(
            "transition",
            isFavorited && "text-atelier-terre",
          )}
          style={{ width: 14, height: 14, strokeWidth: 1.6 }}
          fill={isFavorited ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
        isFavorited && "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
      )}
      aria-label={isFavorited ? labels.remove : labels.add}
      aria-pressed={isFavorited}
    >
      <Heart
        className={cn("h-4 w-4", isFavorited && "fill-current")}
        aria-hidden="true"
      />
    </button>
  );
}
