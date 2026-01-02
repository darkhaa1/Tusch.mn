"use client";

import Link from "next/link";
import { CheckCircle2, MapPin } from "lucide-react";
import type { Listing, ListingUser } from "../lib/api";
import { resolveCategoryLabel } from "./categoryLabels";
import resolveImageUrl from "../lib/resolveImageUrl";
import { Card, CardContent } from "../components/ui/card";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";

type ListingWithOptionalUser = Listing & {
  user?:
    | (ListingUser & { firstname?: string; lastname?: string; name?: string } & Record<string, any>)
    | null;
};

type ListingCardProps = {
  listing: ListingWithOptionalUser;
};

export default function ListingCard({ listing }: ListingCardProps) {
  const categoryLabel = resolveCategoryLabel(listing.category) || listing.category || "Ангилал";
  const heading = categoryLabel;
  const priceLabel =
    typeof listing.price === "number" && listing.price > 0
      ? `${listing.price.toLocaleString()} ₮`
      : "Тохиролцоно";
  const locationLabel = listing.location?.trim() || "Байршил оруулаагүй";
  const coverUrl = resolveImageUrl(listing.images?.[0]?.url) || "/placeholder.jpg";
  const isVerified = Boolean((listing.user as any)?.isVerified || (listing.user as any)?.verified);

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img
            src={coverUrl}
            alt={heading}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {categoryLabel ? (
            <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm backdrop-blur">
              {categoryLabel}
            </span>
          ) : null}
          {isVerified ? (
            <span className="flex items-center gap-1 rounded-full bg-success/90 px-2.5 py-1 text-xs font-medium text-success-foreground shadow-sm backdrop-blur">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Verified</span>
            </span>
          ) : null}
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <p className="text-xl font-semibold leading-tight text-foreground">{priceLabel}</p>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span className="truncate">{locationLabel}</span>
          </div>
        </div>

        <h2 className="text-base font-semibold leading-snug text-foreground">{heading}</h2>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {listing.description?.trim() || "Тайлбар оруулаагүй."}
        </p>

        <div className="mt-auto">
          <Link
            href={`/listings/${listing.id}`}
            className={cn(buttonVariants({ size: "sm" }), "w-full")}
          >
            Дэлгэрэнгүй
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
