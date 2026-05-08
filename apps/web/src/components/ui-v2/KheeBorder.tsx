/**
 * KheeBorder — traditional Mongolian geometric border (хээ).
 * SVG repeating pattern, scales horizontally via preserveAspectRatio="none".
 *
 * @example
 * <KheeBorder />
 * <KheeBorder color="#5e6b3a" height={14} />
 */
import * as React from 'react';

export interface KheeBorderProps {
  /** Stroke color — defaults to atelier-terre (#a8542a) */
  color?: string;
  /** SVG height in px */
  height?: number;
  className?: string;
}

export default function KheeBorder({ color = '#a8542a', height = 10, className = '' }: KheeBorderProps) {
  const id = React.useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 200 10"
      preserveAspectRatio="none"
      className={['w-full', className].join(' ')}
      style={{ height }}
      aria-hidden
    >
      <defs>
        <pattern id={`khee-${id}`} x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
          <path
            d="M0 5 L5 5 L5 2 L10 2 L10 8 L15 8 L15 5 L20 5"
            stroke={color}
            strokeWidth="1.2"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="200" height="10" fill={`url(#khee-${id})`} />
    </svg>
  );
}
