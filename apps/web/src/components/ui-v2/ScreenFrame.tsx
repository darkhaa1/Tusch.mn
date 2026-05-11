/** Atelier ScreenFrame — content wrapper providing paper bg + responsive rhythm. */
import * as React from 'react';

export interface ScreenFrameProps {
  children: React.ReactNode;
  bg?: 'paper' | 'cream' | 'sand';
  fullBleed?: boolean;
  className?: string;
}

const bgClass: Record<NonNullable<ScreenFrameProps['bg']>, string> = {
  paper: 'bg-atelier-paper',
  cream: 'bg-atelier-cream',
  sand: 'bg-atelier-sand',
};

export function ScreenFrame({
  children,
  bg = 'paper',
  fullBleed = false,
  className = '',
}: ScreenFrameProps): React.ReactElement {
  return (
    <div
      className={[
        bgClass[bg],
        'text-atelier-ink',
        'pb-24 md:pb-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ fontFamily: 'var(--at-sans)' }}
    >
      <div className={fullBleed ? '' : 'mx-auto w-full max-w-[1280px] px-5 md:px-14'}>
        {children}
      </div>
    </div>
  );
}
