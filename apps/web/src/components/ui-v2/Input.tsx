/** Atelier Input — paper bg, ink border, optional label/error/icons. */
import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  hint?: string;
}

export function Input({
  label,
  error,
  iconLeft,
  iconRight,
  hint,
  id,
  className = '',
  style,
  ...rest
}: InputProps): React.ReactElement {
  const autoId = React.useId();
  const inputId = id ?? `at-input-${autoId}`;
  const describedBy = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] uppercase tracking-[0.15em] text-atelier-muted"
          style={{ fontFamily: 'var(--at-mono)' }}
        >
          {label}
        </label>
      )}
      <div
        className={[
          'flex items-center gap-2 border border-atelier-ink bg-atelier-paper px-3 py-3',
          'focus-within:ring-2 focus-within:ring-atelier-ink/30',
          error ? 'border-atelier-pourpre' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {iconLeft && <span className="text-atelier-ink/70 shrink-0">{iconLeft}</span>}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            'min-w-0 flex-1 bg-transparent text-sm text-atelier-ink placeholder:text-atelier-muted',
            'outline-none border-0',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ fontFamily: 'var(--at-sans)', ...style }}
          {...rest}
        />
        {iconRight && <span className="text-atelier-ink/70 shrink-0">{iconRight}</span>}
      </div>
      {error ? (
        <span
          id={`${inputId}-err`}
          className="text-[11px] text-atelier-pourpre"
          style={{ fontFamily: 'var(--at-mono)' }}
        >
          {error}
        </span>
      ) : hint ? (
        <span
          id={`${inputId}-hint`}
          className="text-[11px] text-atelier-muted"
          style={{ fontFamily: 'var(--at-mono)' }}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}
