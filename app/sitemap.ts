import type { MetadataRoute } from 'next';
import { locales, hreflangMap } from '@/lib/i18n/config';

const base = 'https://notguilty-legal.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${base}/${locale}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        Object.entries(hreflangMap).map(([lang, path]) => [lang, `${base}${path}`])
      ),
    },
  }));
}
