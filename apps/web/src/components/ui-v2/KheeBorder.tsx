/** Atelier traditional khee SVG border — hidden via --at-khee-display. */
import * as React from 'react';

export interface KheeBorderProps {
  color?: string;
  height?: number;
  className?: string;
  opacity?: number;
}

export function KheeBorder({
  color = 'var(--at-terre)',
  height = 10,
  className,
  opacity,
}: KheeBorderProps): React.ReactElement {
  const reactId = React.useId();
  const id = `khee-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const style: React.CSSProperties = {
    display: 'var(--at-khee-display, block)',
    opacity: opacity ?? 'var(--at-ornament, 0.6)',
  };

  return (
    <svg
      width="100%"
      height={height}
      viewBox="0 0 200 10"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <defs>
        <pattern id={id} x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
          <path
            d="M0 5 L5 5 L5 2 L10 2 L10 8 L15 8 L15 5 L20 5"
            stroke={color}
            strokeWidth="1.2"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="200" height="10" fill={`url(#${id})`} />
    </svg>
  );
}
