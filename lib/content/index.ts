import { defaultLocale, isLocale, Locale } from '@/lib/i18n/config';
import { SiteContent } from './types';
import { ua } from './ua';
import { ru } from './ru';
import { en } from './en';

const content: Record<Locale, SiteContent> = { ua, ru, en };

export function getContent(locale: string): SiteContent {
  return isLocale(locale) ? content[locale] : content[defaultLocale];
}
