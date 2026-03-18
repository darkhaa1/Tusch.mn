import { locales, defaultLocale } from '@web/i18n';
import type { AppLocale } from '@web/i18n';

export { locales, defaultLocale };
export type { AppLocale };
export type Locale = AppLocale;
export const LOCALES = ['mn', 'en'] as const;
export const DEFAULT_LOCALE = 'mn' as const;
