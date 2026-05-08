/**
 * LabelMono — metadata label in monospace caps with tracking.
 * Used for categories, timestamps, counts, and other secondary info.
 *
 * @example
 * <LabelMono>Сантехник · 4.8 ★</LabelMono>
 * <LabelMono className="text-atelier-terre">Шинэ</LabelMono>
 */
import * as React from 'react';

export interface LabelMonoProps {
  children: React.ReactNode;
  className?: string;
}

export default function LabelMono({ children, className = '' }: LabelMonoProps) {
  return (
    <span
      className={[
        'font-mono text-[10px] uppercase tracking-[0.15em] text-atelier-muted',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
