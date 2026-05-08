/**
 * Atelier Button — sharp corners, serif type, three variants.
 *
 * @example
 * <Button variant="primary">Захиалах</Button>
 * <Button variant="outline" size="sm">Дэлгэрэнгүй</Button>
 * <Button variant="ghost" onClick={handleClose}>Болих</Button>
 */
import * as React from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-atelier-ink text-atelier-cream font-serif font-medium hover:bg-atelier-ink/90 active:bg-atelier-ink/80',
  outline:
    'border border-atelier-ink text-atelier-ink font-serif italic bg-transparent hover:bg-atelier-ink/5 active:bg-atelier-ink/10',
  ghost:
    'text-atelier-ink bg-transparent hover:bg-atelier-ink/5 active:bg-atelier-ink/10',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          'inline-flex items-center justify-center rounded-none transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atelier-ink focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-40',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'AtelierButton';

export default Button;
