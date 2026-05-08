/**
 * DropCap — styles the first character of a text block as a large serif initial.
 * Uses CSS ::first-letter so the rest of the paragraph reflows naturally.
 *
 * @example
 * <DropCap>
 *   Монголын гэр бүл бол нийгмийн суурь нэгж юм.
 * </DropCap>
 */
import * as React from 'react';

export interface DropCapProps {
  children: React.ReactNode;
  className?: string;
}

export default function DropCap({ children, className = '' }: DropCapProps) {
  return (
    <p
      className={[
        'font-sans text-base leading-relaxed text-atelier-ink [&::first-letter]:float-left [&::first-letter]:mr-1 [&::first-letter]:font-serif [&::first-letter]:text-5xl [&::first-letter]:font-medium [&::first-letter]:leading-[0.8] [&::first-letter]:text-atelier-terre',
        className,
      ].join(' ')}
    >
      {children}
    </p>
  );
}
