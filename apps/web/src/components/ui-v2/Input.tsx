/**
 * Atelier Input — sharp corners, paper background, ink border.
 *
 * @example
 * <Input label="Нэр" placeholder="Нэрээ оруулна уу" />
 * <Input type="search" iconLeft={<SearchIcon />} placeholder="Хайх..." />
 * <Input error="Буруу утга оруулсан байна" />
 */
import * as React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, iconLeft, iconRight, className = '', id, ...rest }, ref) => {
    const inputId = id ?? (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-atelier-muted"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {iconLeft && (
            <span className="pointer-events-none absolute left-3 text-atelier-muted">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-none border border-atelier-ink bg-atelier-paper font-sans text-atelier-ink',
              'px-3 py-2.5 text-base placeholder:text-atelier-muted/60',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-atelier-ink focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-40',
              error ? 'border-atelier-terre' : '',
              iconLeft ? 'pl-9' : '',
              iconRight ? 'pr-9' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          />
          {iconRight && (
            <span className="pointer-events-none absolute right-3 text-atelier-muted">
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-atelier-terre">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'AtelierInput';

export default Input;
