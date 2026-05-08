/**
 * ATPlaceholder — diagonal stripe texture for image placeholders.
 * Uses inline CSS for the gradient so arbitrary Tailwind values stay clean.
 *
 * @example
 * <Placeholder tone="sand" height={200} label="ЗУРАГ БАЙХГҮЙ" />
 * <Placeholder tone="terre" aspectRatio="4/3" />
 */
import * as React from 'react';

export type PlaceholderTone = 'sand' | 'terre' | 'olive' | 'beige';

export interface PlaceholderProps {
  tone?: PlaceholderTone;
  height?: number | string;
  aspectRatio?: string;
  label?: string;
  className?: string;
}

const toneColors: Record<PlaceholderTone, { bg: string; stripe: string }> = {
  sand: { bg: '#e8ddc8', stripe: 'rgba(232,221,200,0.7)' },
  terre: { bg: '#a8542a', stripe: 'rgba(168,84,42,0.7)' },
  olive: { bg: '#5e6b3a', stripe: 'rgba(94,107,58,0.7)' },
  beige: { bg: '#f0e8d5', stripe: 'rgba(240,232,213,0.7)' },
};

const toneTextColor: Record<PlaceholderTone, string> = {
  sand: '#8a7f6f',
  terre: '#f4ede1',
  olive: '#f4ede1',
  beige: '#8a7f6f',
};

export default function Placeholder({
  tone = 'sand',
  height,
  aspectRatio,
  label,
  className = '',
}: PlaceholderProps) {
  const { bg, stripe } = toneColors[tone];

  const style: React.CSSProperties = {
    background: `repeating-linear-gradient(135deg, ${bg}, ${bg} 8px, ${stripe} 8px, ${stripe} 16px)`,
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
    ...(aspectRatio !== undefined ? { aspectRatio } : {}),
    ...(height === undefined && aspectRatio === undefined ? { height: '160px' } : {}),
  };

  return (
    <div
      className={['relative flex w-full items-center justify-center', className].join(' ')}
      style={style}
    >
      {label && (
        <span
          className="font-mono text-[10px] uppercase tracking-[0.15em]"
          style={{ color: toneTextColor[tone] }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
