/** Atelier mobile statusbar — fake time/signal/battery, mobile only. */
import * as React from 'react';

export interface StatusBarProps {
  time?: string;
  inkColor?: string;
  className?: string;
}

export function StatusBar({
  time = '9:41',
  inkColor = 'var(--at-ink)',
  className = '',
}: StatusBarProps): React.ReactElement {
  return (
    <div
      className={['block md:hidden flex items-center justify-between', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        height: 38,
        padding: '0 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'var(--at-sans)',
        fontWeight: 600,
        fontSize: 13,
        color: inkColor,
      }}
      role="presentation"
      aria-hidden="true"
    >
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: 0.85 }}>
        <svg width="15" height="10" viewBox="0 0 15 10">
          <path
            d="M1 9h2V6H1v3zm4 0h2V4H5v5zm4 0h2V2H9v7zm4 0h2V0h-2v9z"
            fill={inkColor}
          />
        </svg>
        <div
          style={{
            width: 22,
            height: 10,
            border: `1px solid ${inkColor}`,
            opacity: 0.6,
            borderRadius: 2.5,
            padding: 1,
            display: 'flex',
          }}
        >
          <div style={{ flex: 1, background: inkColor, borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}
