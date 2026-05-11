/** Atelier Button — serif label, ink/cream tones, optional italic flourish. */
import * as React from 'react';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  italic?: boolean;
  full?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-atelier-ink text-atelier-cream border border-atelier-ink hover:opacity-90',
  outline:
    'bg-transparent text-atelier-ink border border-atelier-ink hover:bg-atelier-ink hover:text-atelier-cream',
  ghost: 'bg-transparent text-atelier-ink border border-transparent hover:bg-atelier-cream',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-[13px]',
  md: 'px-4 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  italic = false,
  full = false,
  className = '',
  style,
  children,
  ...rest
}: ButtonProps): React.ReactElement {
  const composed = [
    'inline-flex items-center justify-center gap-2 font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atelier-ink/40',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variantClass[variant],
    sizeClass[size],
    full ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const mergedStyle: React.CSSProperties = {
    fontFamily: 'var(--at-serif)',
    fontStyle: italic ? 'var(--at-italic-style, italic)' : 'normal',
    ...style,
  };

  return (
    <button className={composed} style={mergedStyle} {...rest}>
      {children}
    </button>
  );
}
