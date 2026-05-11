/** Atelier section header — serif italic title + mono caps action label. */
import * as React from 'react';
import { LabelMono } from './LabelMono';

export interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  number?: string;
  action?: React.ReactNode;
  italic?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const titleSize: Record<NonNullable<SectionHeaderProps['size']>, number> = {
  sm: 18,
  md: 26,
  lg: 36,
};

export function SectionHeader({
  title,
  subtitle,
  number,
  action,
  italic = false,
  size = 'md',
  className = '',
}: SectionHeaderProps): React.ReactElement {
  return (
    <div
      className={['flex items-end justify-between gap-4', className].filter(Boolean).join(' ')}
    >
      <div className="min-w-0">
        {number && <LabelMono>{number}</LabelMono>}
        <h2
          className="m-0 text-atelier-ink"
          style={{
            fontFamily: 'var(--at-serif)',
            fontWeight: 500,
            fontSize: titleSize[size],
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            fontStyle: italic ? 'var(--at-italic-style, italic)' : 'normal',
            marginTop: number ? 6 : 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <div
            className="mt-1 text-atelier-muted"
            style={{
              fontFamily: 'var(--at-serif)',
              fontStyle: 'var(--at-italic-style, italic)',
              fontSize: 13,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
