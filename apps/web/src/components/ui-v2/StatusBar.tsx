/**
 * StatusBar — mobile fake status bar (time, signal, battery).
 * Design-system visual only; not a real native status bar.
 *
 * @example
 * <StatusBar time="9:41" />
 */
import * as React from 'react';

export interface StatusBarProps {
  time?: string;
  className?: string;
}

export default function StatusBar({ time = '9:41', className = '' }: StatusBarProps) {
  return (
    <div
      className={[
        'flex h-7 items-center justify-between bg-atelier-ink px-4 text-atelier-cream',
        className,
      ].join(' ')}
    >
      <span className="font-mono text-[11px] font-medium">{time}</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-label="Сигнал">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor" />
          <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="currentColor" />
          <rect x="9" y="2" width="3" height="10" rx="0.5" fill="currentColor" />
          <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" fill="currentColor" opacity="0.3" />
        </svg>
        {/* Battery */}
        <svg width="22" height="12" viewBox="0 0 22 12" fill="none" aria-label="Батарей">
          <rect x="0.5" y="0.5" width="18" height="11" rx="2" stroke="currentColor" strokeOpacity="0.6" />
          <rect x="1.5" y="1.5" width="14" height="9" rx="1.5" fill="currentColor" />
          <path d="M19.5 4v4a2 2 0 000-4z" fill="currentColor" fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
}
