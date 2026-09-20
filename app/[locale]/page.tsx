import Hero from './sections/Hero';
import Stats from './sections/Stats';
import HowItWorks from './sections/HowItWorks';
import Team from './sections/Team';
import Services from './sections/Services';
import NotSureCTA from './sections/NotSureCTA';
import WhyUs from './sections/WhyUs';
import FAQ from './sections/FAQ';
import Contact from './sections/Contact';

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale === 'en') {
    return (
      <main>
        <Hero locale={locale} />
        <Stats locale={locale} />
        <HowItWorks locale={locale} />
        <Services locale={locale} />
        <NotSureCTA locale={locale} />
        <Team locale={locale} />
        <WhyUs locale={locale} />
        <FAQ locale={locale} />
        <Contact locale={locale} />
      </main>
    );
  }

  return (
    <main>
      <Hero locale={locale} />
      <Stats locale={locale} />
      <Team locale={locale} />
      <Services locale={locale} />
      <WhyUs locale={locale} />
      <FAQ locale={locale} />
      <Contact locale={locale} />
    </main>
  );
}
