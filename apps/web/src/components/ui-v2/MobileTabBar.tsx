'use client';

/** Atelier mobile tab bar — 5 icons (нүүр/хайх/нийтлэх/зурвас/би), bottom-fixed. */
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  href: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  match: (pathname: string) => boolean;
}

const tabs: ReadonlyArray<TabItem> = [
  {
    id: 'home',
    label: 'Нүүр',
    href: '/',
    Icon: Home,
    match: (p) => p === '/' || p === '',
  },
  {
    id: 'search',
    label: 'Хайх',
    href: '/listings',
    Icon: Search,
    match: (p) => p.startsWith('/listings') || p.startsWith('/categories') || p.startsWith('/offerers'),
  },
  {
    id: 'create',
    label: 'Нийтлэх',
    href: '/listings/new',
    Icon: Plus,
    match: (p) => p.startsWith('/listings/new'),
  },
  {
    id: 'msg',
    label: 'Зурвас',
    href: '/messages',
    Icon: MessageSquare,
    match: (p) => p.startsWith('/messages'),
  },
  {
    id: 'me',
    label: 'Би',
    href: '/dashboard',
    Icon: User,
    match: (p) => p.startsWith('/dashboard') || p.startsWith('/profile'),
  },
];

export function MobileTabBar(): React.ReactElement {
  const pathname = usePathname() ?? '/';

  return (
    <nav
      aria-label="Үндсэн цэс"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-atelier-line bg-atelier-paper"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex justify-around px-2 pt-2 pb-3.5">
        {tabs.map((t) => {
          const on = t.match(pathname);
          const Icon = t.Icon;
          return (
            <li key={t.id} className="flex-1">
              <Link
                href={t.href}
                className="flex flex-col items-center gap-0.5 py-1"
                aria-current={on ? 'page' : undefined}
                style={{
                  color: on ? 'var(--at-ink)' : 'var(--at-muted)',
                }}
              >
                <Icon size={20} strokeWidth={on ? 2 : 1.6} />
                <span
                  style={{
                    fontFamily: 'var(--at-sans)',
                    fontSize: 9.5,
                    fontWeight: on ? 600 : 500,
                    letterSpacing: '0.02em',
                  }}
                >
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
