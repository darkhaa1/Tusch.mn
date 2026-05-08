/**
 * SectionHeader — serif italic title with an optional mono-caps action.
 * Recurring layout pattern across all redesigned pages.
 *
 * @example
 * <SectionHeader title="Санал болгох үйлчилгээ" action={<a href="/all">Бүгдийг харах</a>} />
 * <SectionHeader title="Сүүлийн захиалгууд" />
 */
import * as React from 'react';

export interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({ title, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={['flex items-baseline justify-between gap-4', className].join(' ')}>
      <h2 className="font-serif text-xl italic text-atelier-ink">{title}</h2>
      {action && (
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-atelier-muted">
          {action}
        </span>
      )}
    </div>
  );
}
