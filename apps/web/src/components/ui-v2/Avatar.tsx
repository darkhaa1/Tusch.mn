/**
 * Atelier Avatar — circular, image or tone-colored fallback with initials.
 *
 * @example
 * <Avatar src="/photo.jpg" alt="Болд" size="md" />
 * <Avatar initials="БД" tone="terre" size="lg" />
 * <Avatar size="sm" tone="olive" />
 */
import * as React from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarTone = 'sand' | 'terre' | 'olive';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  initials?: string;
  className?: string;
}

const sizePx: Record<AvatarSize, number> = {
  sm: 32,
  md: 44,
  lg: 56,
  xl: 80,
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

const toneBg: Record<AvatarTone, string> = {
  sand: 'bg-atelier-sand text-atelier-ink',
  terre: 'bg-atelier-terre text-atelier-cream',
  olive: 'bg-atelier-olive text-atelier-cream',
};

export default function Avatar({
  src,
  alt = '',
  size = 'md',
  tone = 'sand',
  initials,
  className = '',
}: AvatarProps) {
  const px = sizePx[size];

  return (
    <div
      className={[
        'relative shrink-0 overflow-hidden rounded-full',
        sizeClasses[size],
        !src ? toneBg[tone] : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: px, height: px }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-serif font-medium">
          {initials ?? alt.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}
