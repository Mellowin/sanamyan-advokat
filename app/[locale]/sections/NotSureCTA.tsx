import { getContent } from '@/lib/content';

interface NotSureCTAProps {
  locale: string;
}

export default function NotSureCTA({ locale }: NotSureCTAProps) {
  const t = getContent(locale).notSure;

  if (!t) return null;

  return (
    <section className="py-16 bg-amber-500">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.title}</h2>
        <p className="text-slate-800 text-lg mb-8">{t.text}</p>
        <a
          href="#contact"
          className="inline-block px-8 py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors text-lg"
        >
          {t.cta}
        </a>
      </div>
    </section>
  );
}
