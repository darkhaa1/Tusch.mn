'use client';

/**
 * TabBar — bottom navigation for mobile redesign.
 * 5 tabs: Нүүр, Хайх, Нийтлэх (+), Зурвас, Би.
 *
 * @example
 * <TabBar active="home" onTabChange={setTab} />
 */
import * as React from 'react';

export type TabId = 'home' | 'search' | 'create' | 'msg' | 'me';

export interface TabBarProps {
  active?: TabId;
  onTabChange?: (tab: TabId) => void;
  className?: string;
}

interface Tab {
  id: TabId;
  label: string;
  path: string;
  viewBox?: string;
}

const tabs: Tab[] = [
  {
    id: 'home',
    label: 'Нүүр',
    path: 'M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z',
  },
  {
    id: 'search',
    label: 'Хайх',
    path: 'M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-5-5',
  },
  {
    id: 'create',
    label: 'Нийтлэх',
    path: 'M12 5v14M5 12h14',
  },
  {
    id: 'msg',
    label: 'Зурвас',
    path: 'M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H8l-5 4V5z',
  },
  {
    id: 'me',
    label: 'Би',
    path: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0',
  },
];

function TabIcon({ path, active }: { path: string; active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}

export default function TabBar({ active = 'home', onTabChange, className = '' }: TabBarProps) {
  return (
    <nav
      className={[
        'flex items-stretch border-t border-atelier-line bg-atelier-paper',
        'safe-area-inset-bottom pb-safe',
        className,
      ].join(' ')}
      aria-label="Үндсэн цэс"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const isCreate = tab.id === 'create';

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors',
              isCreate
                ? 'mx-2 my-1 bg-atelier-ink text-atelier-cream rounded-none'
                : isActive
                  ? 'text-atelier-ink'
                  : 'text-atelier-muted',
            ].join(' ')}
          >
            <TabIcon path={tab.path} active={isActive} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
