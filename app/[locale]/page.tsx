import Hero from './sections/Hero';
import Stats from './sections/Stats';
import Services from './sections/Services';
import WhyUs from './sections/WhyUs';
import Reviews from './sections/Reviews';
import FAQ from './sections/FAQ';
import Contact from './sections/Contact';

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <main>
      <Hero locale={locale} />
      <Stats locale={locale} />
      <Services locale={locale} />
      <WhyUs locale={locale} />
      <Reviews locale={locale} />
      <FAQ locale={locale} />
      <Contact locale={locale} />
    </main>
  );
}
