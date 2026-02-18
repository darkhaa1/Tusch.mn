import { getRequestConfig } from 'next-intl/server';

export const locales = ['mn', 'en'] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = 'mn';
export const defaultTimeZone = 'Asia/Ulaanbaatar';

export default getRequestConfig(async ({ requestLocale }) => {
  const localeFromRequest = await requestLocale;
  const requested = localeFromRequest as AppLocale | undefined;
  const locale = requested && locales.includes(requested) ? requested : defaultLocale;

  return {
    locale,
    timeZone: defaultTimeZone,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
