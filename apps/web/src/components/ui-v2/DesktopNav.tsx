'use client';

/** Atelier desktop top nav — wordmark + serif italic nav + search hint + locale + avatar. */
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { Wordmark } from './Wordmark';

interface NavItem {
  id: string;
  label: string;
  href: string;
  match: (p: string) => boolean;
}

const items: ReadonlyArray<NavItem> = [
  { id: 'home', label: 'Нүүр', href: '/', match: (p) => p === '/' || p === '' },
  {
    id: 'search',
    label: 'Хайх',
    href: '/listings',
    match: (p) => p.startsWith('/listings') && !p.startsWith('/listings/new'),
  },
  {
    id: 'categories',
    label: 'Ангилал',
    href: '/categories',
    match: (p) => p.startsWith('/categories'),
  },
  {
    id: 'providers',
    label: 'Мастер',
    href: '/offerers',
    match: (p) => p.startsWith('/offerers'),
  },
  {
    id: 'msg',
    label: 'Зурвас',
    href: '/messages',
    match: (p) => p.startsWith('/messages'),
  },
];

export function DesktopNav(): React.ReactElement {
  const pathname = usePathname() ?? '/';

  return (
    <header
      className="hidden md:flex items-center gap-12 bg-atelier-paper border-b border-atelier-line"
      style={{ height: 76, padding: '0 56px', flexShrink: 0 }}
    >
      <Link href="/" aria-label="Tusch.mn нүүр хуудас" className="shrink-0">
        <Wordmark size={28} />
      </Link>
      <nav className="flex gap-7 flex-1" aria-label="Үндсэн цэс">
        {items.map((it) => {
          const on = it.match(pathname);
          return (
            <Link
              key={it.id}
              href={it.href}
              aria-current={on ? 'page' : undefined}
              style={{
                fontFamily: 'var(--at-serif)',
                fontStyle: on ? 'var(--at-italic-style, italic)' : 'normal',
                fontSize: 15,
                color: on ? 'var(--at-terre)' : 'var(--at-ink)',
                borderBottom: on ? '1.5px solid var(--at-terre)' : '1.5px solid transparent',
                paddingBottom: 4,
              }}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-5">
        <Link
          href="/listings"
          className="flex items-center gap-2 bg-atelier-cream border border-atelier-line px-3.5 py-2"
          style={{ width: 280 }}
        >
          <Search size={14} strokeWidth={1.8} className="text-atelier-muted" />
          <span
            className="flex-1 text-atelier-muted"
            style={{ fontSize: 13, fontFamily: 'var(--at-sans)' }}
          >
            Үйлчилгээ, мастер хайх…
          </span>
          <span
            style={{
              fontFamily: 'var(--at-mono)',
              fontSize: 10,
              color: 'var(--at-muted)',
              letterSpacing: '0.1em',
            }}
          >
            ⌘K
          </span>
        </Link>
        <Link
          href="/notifications"
          className="relative"
          aria-label="Мэдэгдэл"
        >
          <Bell size={20} strokeWidth={1.6} className="text-atelier-ink" />
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 rounded-full bg-atelier-terre"
            style={{ width: 8, height: 8 }}
          />
        </Link>
      </div>
    </header>
  );
}
