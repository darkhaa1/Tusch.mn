/** Atelier desktop footer — 5 columns + khee ornament under the brand col. */
import * as React from 'react';
import { Wordmark } from './Wordmark';
import { KheeBorder } from './KheeBorder';

interface Column {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}

const columns: ReadonlyArray<Column> = [
  {
    title: 'Үйлчилгээ',
    links: [
      { label: 'Засвар', href: '/categories' },
      { label: 'Цэвэрлэгээ', href: '/categories' },
      { label: 'Хичээл', href: '/categories' },
      { label: 'Дасгал', href: '/categories' },
      { label: 'Гоо сайхан', href: '/categories' },
      { label: 'Асрамж', href: '/categories' },
    ],
  },
  {
    title: 'Мастер нарт',
    links: [
      { label: 'Мастер болох', href: '/onboarding' },
      { label: 'Үнэлгээ', href: '/reviews' },
      { label: 'Багц', href: '/dashboard' },
      { label: 'Тусламж', href: '/cgu' },
    ],
  },
  {
    title: 'tusch',
    links: [
      { label: 'Бидний тухай', href: '/cgu' },
      { label: 'Сэтгүүл', href: '/cgu' },
      { label: 'Дүүрэг', href: '/villes' },
      { label: 'Ажлын байр', href: '/cgu' },
    ],
  },
  {
    title: 'Хууль',
    links: [
      { label: 'Нөхцөл', href: '/cgu' },
      { label: 'Нууцлал', href: '/confidentialite' },
      { label: 'Күүки', href: '/confidentialite' },
      { label: 'Холбоо', href: '/cgu' },
    ],
  },
];

export function DesktopFooter(): React.ReactElement {
  return (
    <footer
      className="hidden md:grid bg-atelier-cream border-t border-atelier-line"
      style={{
        padding: '40px 56px 30px',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
        gap: 40,
      }}
    >
      <div>
        <Wordmark size={28} />
        <p
          className="text-atelier-muted"
          style={{
            fontFamily: 'var(--at-serif)',
            fontStyle: 'var(--at-italic-style, italic)',
            fontSize: 13,
            marginTop: 14,
            maxWidth: 280,
            lineHeight: 1.5,
          }}
        >
          Танай хорооллын чанартай үйлчилгээ. Улаанбаатараас Дархан хүртэл.
        </p>
        <div style={{ marginTop: 18 }}>
          <KheeBorder height={10} />
        </div>
      </div>
      {columns.map((col) => (
        <div key={col.title}>
          <div
            style={{
              fontFamily: 'var(--at-mono)',
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--at-muted)',
              marginBottom: 14,
            }}
          >
            {col.title}
          </div>
          <ul className="flex flex-col gap-2">
            {col.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  style={{
                    fontFamily: 'var(--at-serif)',
                    fontSize: 13,
                    color: 'var(--at-ink)',
                  }}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </footer>
  );
}
