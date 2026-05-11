'use client';

/**
 * Listing detail gallery — Atelier redesign.
 * Mobile: full-bleed hero (260h) with cream back/share/heart pills + "1 / 6" mono caps badge.
 * Desktop: 2fr/1fr grid, big hero + two stacked tiles, "+N фото" overlay on the last tile when extras exist.
 */
import * as React from 'react';
import Image from 'next/image';
import { Placeholder, type PlaceholderTone } from '@web/components/ui-v2';

export interface GalleryProps {
  imageUrls: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onBack: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
  altPrefix?: string;
}

const TONES: PlaceholderTone[] = ['terre', 'ocre', 'rose', 'olive'];

export function Gallery({
  imageUrls,
  selectedIndex,
  onSelect,
  onBack,
  onShare,
  onFavorite,
  isFavorited = false,
  altPrefix = 'listing image',
}: GalleryProps): React.ReactElement {
  const hasImages = imageUrls.length > 0;
  const total = Math.max(imageUrls.length, 1);
  const hero = hasImages ? imageUrls[selectedIndex] || imageUrls[0] : null;
  const tileA = hasImages ? imageUrls[1] : null;
  const tileB = hasImages ? imageUrls[2] : null;
  const extras = Math.max(0, imageUrls.length - 3);

  return (
    <div className="w-full">
      {/* Mobile hero */}
      <div className="relative md:hidden">
        {hero ? (
          <div className="relative h-[260px] w-full overflow-hidden bg-atelier-sand">
            <Image
              src={hero}
              alt={`${altPrefix} ${selectedIndex + 1}`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <Placeholder tone="terre" height={260} width="100%" />
        )}

        <div className="absolute left-4 right-4 top-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            aria-label="Буцах"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-atelier-cream text-atelier-ink shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                aria-label="Хуваалцах"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-atelier-cream text-atelier-ink shadow-sm"
                style={{ fontFamily: 'var(--at-serif)', fontSize: 15 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
            )}
            {onFavorite && (
              <button
                type="button"
                onClick={onFavorite}
                aria-label={isFavorited ? 'Хадгалснаас хасах' : 'Хадгалах'}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-atelier-cream shadow-sm"
                style={{
                  fontFamily: 'var(--at-serif)',
                  fontSize: 16,
                  color: isFavorited ? 'var(--at-terre)' : 'var(--at-ink)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div
          className="absolute bottom-3 left-4 bg-atelier-ink px-2 py-1 text-atelier-cream"
          style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '0.1em' }}
        >
          {selectedIndex + 1} / {total}
        </div>
      </div>

      {/* Mobile thumb row (only when multiple) */}
      {imageUrls.length > 1 && (
        <div className="md:hidden flex gap-2 overflow-x-auto px-4 pt-3">
          {imageUrls.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => onSelect(i)}
              className="relative h-14 w-14 shrink-0 overflow-hidden border"
              style={{
                borderColor: i === selectedIndex ? 'var(--at-ink)' : 'var(--at-line)',
              }}
              aria-label={`Зураг ${i + 1}`}
            >
              <Image src={url} alt="" fill sizes="56px" className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}

      {/* Desktop gallery grid */}
      <div className="hidden md:grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 8, height: 480 }}>
        <button
          type="button"
          onClick={() => onSelect(0)}
          className="relative h-full w-full overflow-hidden bg-atelier-sand text-left"
          aria-label="Үндсэн зураг"
        >
          {hero ? (
            <Image
              src={hero}
              alt={`${altPrefix} 1`}
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <Placeholder tone={TONES[0]} height="100%" width="100%" />
          )}
          <span
            className="absolute bottom-3 left-3 bg-atelier-ink px-2 py-1 text-atelier-cream"
            style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '0.1em' }}
          >
            {selectedIndex + 1} / {total}
          </span>
        </button>

        <div className="grid h-full" style={{ gridTemplateRows: '1fr 1fr', gap: 8 }}>
          <button
            type="button"
            onClick={() => onSelect(1)}
            className="relative h-full w-full overflow-hidden bg-atelier-sand"
            aria-label="Зураг 2"
          >
            {tileA ? (
              <Image src={tileA} alt={`${altPrefix} 2`} fill sizes="30vw" className="object-cover" unoptimized />
            ) : (
              <Placeholder tone={TONES[1]} height="100%" width="100%" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onSelect(2)}
            className="relative h-full w-full overflow-hidden bg-atelier-sand"
            aria-label="Зураг 3"
          >
            {tileB ? (
              <Image src={tileB} alt={`${altPrefix} 3`} fill sizes="30vw" className="object-cover" unoptimized />
            ) : (
              <Placeholder tone={TONES[2]} height="100%" width="100%" />
            )}
            {extras > 0 && (
              <span
                className="absolute inset-0 flex items-center justify-center text-atelier-cream"
                style={{
                  background: 'rgba(26,23,20,0.42)',
                  fontFamily: 'var(--at-serif)',
                  fontStyle: 'var(--at-italic-style, italic)',
                  fontSize: 18,
                }}
              >
                + {extras} фото
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
