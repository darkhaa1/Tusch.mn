/** Atelier Avatar — round, serif-italic initial fallback, optional placeholder texture. */
import * as React from 'react';
import Image from 'next/image';
import { Placeholder, type PlaceholderTone } from './Placeholder';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  initial?: string;
  size?: AvatarSize;
  tone?: PlaceholderTone;
  className?: string;
}

const sizePx: Record<AvatarSize, number> = { sm: 32, md: 44, lg: 56, xl: 80 };
const initialFontPx: Record<AvatarSize, number> = { sm: 13, md: 17, lg: 22, xl: 32 };

export function Avatar({
  src,
  alt = '',
  initial,
  size = 'md',
  tone = 'sand',
  className = '',
}: AvatarProps): React.ReactElement {
  const px = sizePx[size];
  const fontPx = initialFontPx[size];

  const base = (
    <div
      className={['relative overflow-hidden rounded-full shrink-0', className].filter(Boolean).join(' ')}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={px}
          height={px}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : initial ? (
        <div
          className="h-full w-full flex items-center justify-center bg-atelier-sand text-atelier-ink"
          style={{
            fontFamily: 'var(--at-serif)',
            fontStyle: 'var(--at-italic-style, italic)',
            fontSize: fontPx,
            lineHeight: 1,
          }}
        >
          {initial}
        </div>
      ) : (
        <Placeholder tone={tone} height={px} width={px} />
      )}
    </div>
  );

  return base;
}
