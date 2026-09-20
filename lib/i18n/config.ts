export const locales = ['ua', 'ru', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ua';

// Внутренний route /ua ↔ языковой код uk (ISO 639-1)
export const htmlLang: Record<Locale, string> = {
  ua: 'uk',
  ru: 'ru',
  en: 'en',
};

// hreflang-код → URL-маршрут
export const hreflangMap: Record<string, string> = {
  uk: '/ua',
  ru: '/ru',
  en: '/en',
  'x-default': '/ua',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
