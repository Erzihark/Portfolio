import es from './es';
import en from './en';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

const messages = { es, en };
export type Messages = typeof es;

export function useTranslations(locale: Locale): Messages {
  return messages[locale];
}

// Return the home path for a locale. The path includes the base path.
export function localePath(locale: Locale): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return locale === defaultLocale ? `${base}/` : `${base}/${locale}/`;
}
