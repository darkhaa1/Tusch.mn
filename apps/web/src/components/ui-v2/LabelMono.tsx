/** Atelier mono caps eyebrow label — small, tracked, muted by default. */
import * as React from 'react';

export interface LabelMonoProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm';
  tone?: 'muted' | 'ink' | 'terre' | 'cobalt' | 'olive' | 'pourpre' | 'rose' | 'ocre';
}

const toneClass: Record<NonNullable<LabelMonoProps['tone']>, string> = {
  muted: 'text-atelier-muted',
  ink: 'text-atelier-ink',
  terre: 'text-atelier-terre',
  cobalt: 'text-atelier-cobalt',
  olive: 'text-atelier-olive',
  pourpre: 'text-atelier-pourpre',
  rose: 'text-atelier-rose',
  ocre: 'text-atelier-ocre',
};

export function LabelMono({
  size = 'xs',
  tone = 'muted',
  className = '',
  style,
  children,
  ...rest
}: LabelMonoProps): React.ReactElement {
  const fontSize = size === 'xs' ? 10 : 11;
  return (
    <span
      className={['uppercase', toneClass[tone], className].filter(Boolean).join(' ')}
      style={{
        fontFamily: 'var(--at-mono)',
        letterSpacing: '0.15em',
        fontSize,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
