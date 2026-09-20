import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { locales, htmlLang, hreflangMap, isLocale } from '@/lib/i18n/config';
import { getContent } from '@/lib/content';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : 'ua';
  const { metadata } = getContent(loc);

  return {
    metadataBase: new URL('https://notguilty-legal.com'),
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: `/${loc}`,
      languages: hreflangMap,
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <html lang={htmlLang[locale]}>
      <body className="antialiased">
        <Header locale={locale} />
        <main className="pt-16">
          {children}
        </main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
