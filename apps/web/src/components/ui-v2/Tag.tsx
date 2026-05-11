/** Atelier Tag — ink/cream filled, line-outline, or tone-outlined. */
import * as React from 'react';

export type TagVariant = 'active' | 'inactive' | 'outline-tone';
export type TagTone = 'terre' | 'olive' | 'cobalt' | 'rose' | 'ocre' | 'pourpre';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  tone?: TagTone;
  italic?: boolean;
  mono?: boolean;
}

const toneText: Record<TagTone, string> = {
  terre: 'text-atelier-terre border-atelier-terre',
  olive: 'text-atelier-olive border-atelier-olive',
  cobalt: 'text-atelier-cobalt border-atelier-cobalt',
  rose: 'text-atelier-rose border-atelier-rose',
  ocre: 'text-atelier-ocre border-atelier-ocre',
  pourpre: 'text-atelier-pourpre border-atelier-pourpre',
};

export function Tag({
  variant = 'inactive',
  tone = 'terre',
  italic = false,
  mono = false,
  className = '',
  style,
  children,
  ...rest
}: TagProps): React.ReactElement {
  const base =
    'inline-flex items-center px-3 py-1.5 text-[11px] tracking-[0.08em] uppercase select-none whitespace-nowrap';

  const variantClass =
    variant === 'active'
      ? 'bg-atelier-ink text-atelier-cream border border-transparent'
      : variant === 'outline-tone'
        ? `bg-transparent border ${toneText[tone]}`
        : 'bg-transparent text-atelier-ink border border-atelier-line';

  const fontFamily = mono ? 'var(--at-mono)' : 'var(--at-serif)';
  const fontStyle = italic ? 'var(--at-italic-style, italic)' : 'normal';
  const textTransform = mono ? 'uppercase' : 'none';
  const letterSpacing = mono ? '0.1em' : 'normal';
  const fontSize = mono ? 10 : 13;

  return (
    <span
      className={[base, variantClass, className].filter(Boolean).join(' ')}
      style={{ fontFamily, fontStyle, textTransform, letterSpacing, fontSize, ...style }}
      {...rest}
    >
      {children}
    </span>
  );
}
