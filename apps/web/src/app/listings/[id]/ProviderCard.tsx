'use client';

/**
 * Provider card for listing detail — Atelier redesign.
 * 56px avatar (terre placeholder fallback), serif name, mono meta line,
 * "Профайл үзэх →" italic link. Used in the desktop sticky aside.
 */
import * as React from 'react';
import Link from 'next/link';
import { Avatar } from '@web/components/ui-v2';

const labels = {
  memberSince: 'оноос гишүүн',
  reviews: 'сэтгэгдэл',
  verified: 'Үнэмлэх',
  responseRate: 'хариу',
  viewProfile: 'Профайл үзэх',
  unknown: 'Үйлчилгээ үзүүлэгч',
};

export interface ProviderCardProps {
  name: string;
  avatar?: string | null;
  city?: string | null;
  memberSinceYear?: number | string | null;
  rating?: number | null;
  reviewCount?: number | null;
  isVerified?: boolean;
  responseRate?: number | null;
  profileHref?: string | null;
}

export function ProviderCard({
  name,
  avatar,
  city,
  memberSinceYear,
  rating,
  reviewCount,
  isVerified = false,
  responseRate,
  profileHref,
}: ProviderCardProps): React.ReactElement {
  const initial = name ? name.charAt(0).toUpperCase() : 'Ү';
  const safeName = name || labels.unknown;
  const metaParts: string[] = [];
  if (city) metaParts.push(city);
  if (memberSinceYear) metaParts.push(`${memberSinceYear} ${labels.memberSince}`);

  return (
    <div
      className="bg-atelier-paper"
      style={{ padding: 22, border: '1px solid var(--at-line)' }}
    >
      <div className="flex items-center gap-4">
        <Avatar src={avatar || undefined} initial={initial} size="lg" tone="terre" />
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-atelier-ink"
            style={{ fontFamily: 'var(--at-serif)', fontSize: 17, fontWeight: 500 }}
          >
            {safeName}
          </div>
          {metaParts.length > 0 && (
            <div className="text-atelier-muted" style={{ fontFamily: 'var(--at-sans)', fontSize: 12, marginTop: 2 }}>
              {metaParts.join(' · ')}
            </div>
          )}
        </div>
      </div>

      {(rating != null || isVerified || responseRate != null) && (
        <div
          className="mt-4 flex flex-wrap items-center gap-4 pt-4 text-atelier-muted"
          style={{
            borderTop: '1px solid var(--at-line)',
            fontFamily: 'var(--at-mono)',
            fontSize: 10,
            letterSpacing: '0.05em',
          }}
        >
          {rating != null && (
            <span>
              <b className="text-atelier-terre" style={{ fontSize: 14, fontFamily: 'var(--at-serif)', fontStyle: 'var(--at-italic-style, italic)' }}>
                ★ {rating.toFixed(1).replace('.', ',')}
              </b>
              {reviewCount != null && <> · {reviewCount} {labels.reviews}</>}
            </span>
          )}
          {isVerified && (
            <span>
              <b className="text-atelier-cobalt">✓</b> {labels.verified}
            </span>
          )}
          {responseRate != null && <span>{responseRate}% {labels.responseRate}</span>}
        </div>
      )}

      {profileHref && (
        <Link
          href={profileHref}
          className="mt-4 inline-block text-atelier-ink hover:text-atelier-terre"
          style={{ fontFamily: 'var(--at-serif)', fontStyle: 'var(--at-italic-style, italic)', fontSize: 14 }}
        >
          {labels.viewProfile} →
        </Link>
      )}
    </div>
  );
}
