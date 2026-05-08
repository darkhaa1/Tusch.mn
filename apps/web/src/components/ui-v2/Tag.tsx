/**
 * Atelier Tag / Chip — italic serif label, two states.
 *
 * @example
 * <Tag variant="active">Засвар</Tag>
 * <Tag variant="inactive" onClick={() => setCategory('cleaning')}>Цэвэрлэгээ</Tag>
 */
import * as React from 'react';

export type TagVariant = 'active' | 'inactive';

export interface TagProps {
  variant?: TagVariant;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  active: 'bg-atelier-ink text-atelier-cream',
  inactive: 'border border-atelier-line text-atelier-ink bg-transparent hover:border-atelier-ink',
};

export default function Tag({ variant = 'inactive', children, onClick, className = '' }: TagProps) {
  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      onClick={onClick}
      className={[
        'inline-flex items-center rounded-none px-3 py-1 font-serif text-sm italic transition-colors',
        onClick ? 'cursor-pointer' : '',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
}
