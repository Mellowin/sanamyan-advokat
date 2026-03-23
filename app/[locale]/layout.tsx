import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../globals.css';

const locales = ['ua', 'ru'];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
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
