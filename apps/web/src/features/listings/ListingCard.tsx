"use client";

import Link from "next/link";
import Image from "next/image";
import type { Listing, ListingUser } from "@web/lib/api/types";
import { resolveCategoryLabel } from "./categoryLabels";
import resolveImageUrl from "@web/lib/resolveImageUrl";
import type { PlaceholderTone } from "@web/components/ui-v2";
import { Placeholder } from "@web/components/ui-v2";
import { FavoriteListingButton } from "./FavoriteListingButton";

type ListingWithOptionalUser = Listing & {
  user?:
    | (ListingUser & {
        firstname?: string;
        lastname?: string;
        name?: string;
        rating?: number | string;
      } & Record<string, unknown>)
    | null;
};

type ListingCardProps = {
  listing: ListingWithOptionalUser;
  priority?: boolean;
  /** Force a specific tone for the striped placeholder fallback. */
  tone?: PlaceholderTone;
};

const labels = {
  fallbackPrice: "Тохиролцоно",
  fallbackLocation: "УБ",
  fallbackTitle: "Зар",
  reviewsSuffix: "сэтгэгдэл",
};

const TONE_CYCLE: PlaceholderTone[] = [
  "terre",
  "cobalt",
  "ocre",
  "rose",
  "olive",
  "pourpre",
];

function pickTone(id: string): PlaceholderTone {
  if (!id) return "sand";
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return TONE_CYCLE[sum % TONE_CYCLE.length] ?? "sand";
}

function formatProviderName(user: ListingWithOptionalUser["user"]): string {
  if (!user) return "";
  const first =
    (user as Record<string, unknown>).firstName ??
    (user as Record<string, unknown>).firstname ??
    "";
  const last =
    (user as Record<string, unknown>).lastName ??
    (user as Record<string, unknown>).lastname ??
    "";
  const name =
    (typeof first === "string" || typeof last === "string") &&
    `${String(first || "").trim()} ${String(last || "").trim()}`.trim();
  if (name) return name;
  const fallback = (user as Record<string, unknown>).name;
  if (typeof fallback === "string" && fallback.trim()) return fallback.trim();
  return "";
}

function formatRating(value: number | string | undefined): string | null {
  if (value === undefined || value === null) return null;
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(n) || n <= 0) return null;
  // Render with a comma like the Atelier design: "4,9"
  return n.toFixed(1).replace(".", ",");
}

export default function ListingCard({
  listing,
  priority = false,
  tone,
}: ListingCardProps) {
  const categoryLabel =
    resolveCategoryLabel(listing.category) || listing.category || labels.fallbackTitle;
  const title = listing.description?.trim()
    ? (listing.description.split(/\n/)[0] ?? "").slice(0, 80)
    : categoryLabel;

  const priceLabel =
    typeof listing.price === "number" && listing.price > 0
      ? `${listing.price.toLocaleString()}₮`
      : labels.fallbackPrice;

  const locationLabel = listing.location?.trim() || labels.fallbackLocation;
  const providerName = formatProviderName(listing.user);
  const ratingValue = formatRating(
    (listing.user as { rating?: number | string } | undefined)?.rating,
  );
  const reviewsCount = (listing as { favoritesCount?: number }).favoritesCount;

  const coverUrl =
    resolveImageUrl(listing.images?.[0]?.thumbnailUrl) ||
    resolveImageUrl(listing.images?.[0]?.url) ||
    "";

  const resolvedTone = tone ?? pickTone(listing.id);
  const href = `/listings/${listing.id}`;

  const whoLineMobile = [providerName, locationLabel].filter(Boolean).join(" · ");
  const whoLineDesktop = [providerName, locationLabel].filter(Boolean).join(" · ");

  return (
    <>
      {/* Mobile row: 88x88 image left + content right */}
      <Link
        href={href}
        className="flex gap-3.5 md:hidden"
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--at-line)",
          textDecoration: "none",
          color: "var(--at-ink)",
        }}
      >
        <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              sizes="88px"
              priority={priority}
              className="object-cover"
            />
          ) : (
            <Placeholder tone={resolvedTone} height={88} width={88} />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div
              className="flex-1"
              style={{
                fontFamily: "var(--at-serif)",
                fontSize: 16,
                fontWeight: 500,
                lineHeight: 1.25,
                color: "var(--at-ink)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </div>
            <span className="shrink-0">
              <FavoriteListingButton listingId={listing.id} size="sm" />
            </span>
          </div>
          {whoLineMobile ? (
            <div
              className="mt-1"
              style={{ fontSize: 11.5, color: "var(--at-muted)" }}
            >
              {whoLineMobile}
            </div>
          ) : null}
          <div className="mt-2 flex items-center justify-between">
            <div
              style={{
                fontFamily: "var(--at-serif)",
                fontSize: 13,
                fontStyle: "var(--at-italic-style, italic)",
                color: "var(--at-ink)",
              }}
            >
              {priceLabel}
            </div>
            {ratingValue ? (
              <div
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  color: "var(--at-terre)",
                }}
              >
                ★ {ratingValue}
              </div>
            ) : null}
          </div>
        </div>
      </Link>

      {/* Desktop card: 160x160 image + column content */}
      <Link
        href={href}
        className="hidden md:flex"
        style={{
          gap: 16,
          padding: "4px 0",
          textDecoration: "none",
          color: "var(--at-ink)",
        }}
      >
        <div
          className="relative shrink-0"
          style={{ width: 160, height: 160 }}
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              sizes="160px"
              priority={priority}
              className="object-cover"
            />
          ) : (
            <Placeholder tone={resolvedTone} height={160} width={160} dense />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div
              style={{
                fontFamily: "var(--at-serif)",
                fontSize: 17,
                fontWeight: 500,
                lineHeight: 1.2,
                color: "var(--at-ink)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </div>
            <span className="shrink-0">
              <FavoriteListingButton listingId={listing.id} size="sm" />
            </span>
          </div>
          {whoLineDesktop ? (
            <div
              className="mt-1.5"
              style={{ fontSize: 12.5, color: "var(--at-muted)" }}
            >
              {whoLineDesktop}
            </div>
          ) : null}
          <div style={{ flex: 1 }} />
          <div
            className="mt-2 flex items-center justify-between pt-2.5"
            style={{ borderTop: "1px solid var(--at-line)" }}
          >
            <div
              style={{
                fontFamily: "var(--at-serif)",
                fontSize: 15,
                fontStyle: "var(--at-italic-style, italic)",
                color: "var(--at-ink)",
              }}
            >
              {priceLabel}
            </div>
            <div
              className="flex items-center gap-2"
              style={{
                fontFamily: "var(--at-mono)",
                fontSize: 10,
                letterSpacing: "0.05em",
                color: "var(--at-muted)",
              }}
            >
              {ratingValue ? (
                <span style={{ color: "var(--at-terre)" }}>★ {ratingValue}</span>
              ) : null}
              {typeof reviewsCount === "number" && reviewsCount > 0 ? (
                <span>
                  · {reviewsCount} {labels.reviewsSuffix}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
