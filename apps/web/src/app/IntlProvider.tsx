'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@web/messages/en.json';
import mnMessages from '@web/messages/mn.json';
import { defaultLocale, defaultTimeZone, locales, type AppLocale } from '@web/i18n';

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = 'tusch.locale';
const MESSAGES: Record<AppLocale, typeof mnMessages> = {
  mn: mnMessages,
  en: enMessages,
};

export function useAppLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useAppLocale must be used within IntlProvider');
  }
  return context;
}

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>(() => {
    if (typeof window === 'undefined') return defaultLocale;
    const storedLocale = localStorage.getItem(STORAGE_KEY) as AppLocale | null;
    return storedLocale && locales.includes(storedLocale) ? storedLocale : defaultLocale;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale((prev) => (prev === 'mn' ? 'en' : 'mn')),
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider
        locale={locale}
        messages={MESSAGES[locale]}
        timeZone={defaultTimeZone}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
