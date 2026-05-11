/** Atelier DropCap — magazine first-letter treatment on a serif paragraph. */
import * as React from 'react';

export interface DropCapProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
  className?: string;
}

export function DropCap({
  children,
  color = 'var(--at-ink)',
  size = 38,
  className = '',
}: DropCapProps): React.ReactElement {
  const text = typeof children === 'string' ? children : null;

  if (text && text.length > 0) {
    const first = text.charAt(0);
    const rest = text.slice(1);
    return (
      <p
        className={['m-0', className].filter(Boolean).join(' ')}
        style={{ fontFamily: 'var(--at-serif)', fontSize: 15, lineHeight: 1.55, color: 'var(--at-ink)' }}
      >
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--at-serif)',
            float: 'left',
            fontSize: size,
            lineHeight: 0.9,
            paddingTop: 4,
            paddingRight: 8,
            color,
            fontWeight: 500,
          }}
        >
          {first}
        </span>
        {rest}
      </p>
    );
  }

  return (
    <div
      className={['at-dropcap m-0', className].filter(Boolean).join(' ')}
      style={
        {
          fontFamily: 'var(--at-serif)',
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--at-ink)',
          ['--at-dropcap-color' as string]: color,
          ['--at-dropcap-size' as string]: `${size}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
