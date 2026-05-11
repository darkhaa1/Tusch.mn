/** Atelier wordmark — "tus" + italic "ch" + colored dot. */
import * as React from 'react';

export interface WordmarkProps {
  size?: number;
  dotColor?: string;
  italColor?: string;
  className?: string;
  as?: 'span' | 'a';
  href?: string;
}

export function Wordmark({
  size = 26,
  dotColor = 'var(--at-terre)',
  italColor = 'var(--at-terre)',
  className = '',
  as = 'span',
  href,
}: WordmarkProps): React.ReactElement {
  const inner = (
    <>
      tus
      <span style={{ fontStyle: 'italic', color: italColor }}>ch</span>
      <span style={{ color: dotColor }}>.</span>
    </>
  );

  const style: React.CSSProperties = {
    fontFamily: 'var(--at-serif)',
    fontSize: size,
    fontWeight: 500,
    letterSpacing: `${-size * 0.04}px`,
    color: 'var(--at-ink)',
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'baseline',
  };

  if (as === 'a') {
    return (
      <a href={href ?? '/'} className={className} style={style} aria-label="tusch.">
        {inner}
      </a>
    );
  }

  return (
    <span className={className} style={style}>
      {inner}
    </span>
  );
}
