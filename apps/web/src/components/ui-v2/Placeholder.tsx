/** Atelier striped placeholder — 135deg repeating gradient, tone-aware. */
import * as React from 'react';

export type PlaceholderTone =
  | 'sand'
  | 'terre'
  | 'olive'
  | 'rose'
  | 'ocre'
  | 'cobalt'
  | 'pourpre'
  | 'cream';

export interface PlaceholderProps {
  tone?: PlaceholderTone;
  label?: string;
  dense?: boolean;
  height?: number | string;
  width?: number | string;
  rounded?: 'none' | 'sm' | 'md' | 'full';
  className?: string;
  style?: React.CSSProperties;
}

const colorMap: Record<PlaceholderTone, [string, string]> = {
  sand: ['#e8ddc8', '#d4c2a3'],
  terre: ['#a8542a', '#8a4220'],
  rose: ['#d97a5f', '#c0654c'],
  ocre: ['#e0a830', '#c89020'],
  olive: ['#5e6b3a', '#4a5530'],
  cobalt: ['#264a8b', '#1a3870'],
  pourpre: ['#7a2b3a', '#5e1f2c'],
  cream: ['#f4ede1', '#e8ddc8'],
};

const darkTones: ReadonlyArray<PlaceholderTone> = ['terre', 'olive', 'cobalt', 'pourpre', 'rose'];

const roundedClass: Record<NonNullable<PlaceholderProps['rounded']>, string> = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  full: 'rounded-full',
};

export function Placeholder({
  tone = 'sand',
  label,
  dense = false,
  height = 160,
  width = '100%',
  rounded = 'none',
  className = '',
  style,
}: PlaceholderProps): React.ReactElement {
  const [a, b] = colorMap[tone];
  const dark = darkTones.includes(tone);
  const bg = dense
    ? `repeating-linear-gradient(135deg, ${a}, ${a} 4px, ${b} 4px, ${b} 8px)`
    : `repeating-linear-gradient(135deg, ${a}, ${a} 10px, ${b}cc 10px, ${b}cc 20px)`;

  return (
    <div
      className={[
        'relative overflow-hidden flex items-end',
        roundedClass[rounded],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width, height, background: bg, padding: label ? 10 : 0, ...style }}
    >
      {label && (
        <span
          className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5"
          style={{
            fontFamily: 'var(--at-mono)',
            color: dark ? 'var(--at-cream)' : 'var(--at-ink)',
            background: dark ? 'rgba(244,237,225,0.18)' : 'var(--at-cream)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
