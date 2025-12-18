"use client";

import Link from "next/link";
import type { Listing } from "../lib/api";
import { resolveCategoryLabel } from "./categoryLabels";
type ListingCardProps = {
  listing: Listing;
};



export default function ListingCard({ listing }: ListingCardProps) {
  const categoryLabel = resolveCategoryLabel(listing.category) || "Ангилалгүй";
  const authorName = listing.user
    ? `${listing.user.firstName} ${listing.user.lastName}`.trim()
    : "Auteur inconnu";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md">
      <div className="h-40 w-full overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/placeholder.jpg"
          alt={listing.title || "Annonce"}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold leading-snug">{listing.title}</h2>
          {categoryLabel ? (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              {categoryLabel}
            </span>
          ) : null}
        </div>
        <div className="text-xs text-gray-500">{authorName}</div>
        <Link
          href={`/listings/${listing.id}`}
          className="mt-auto rounded bg-blue-600 py-1.5 text-center text-sm text-white transition hover:bg-blue-700"
        >
          Дэлгэрэнгүй
        </Link>
      </div>
    </div>
  );
}
