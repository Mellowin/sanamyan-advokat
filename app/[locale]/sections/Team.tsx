'use client';

import { getContent } from '@/lib/content';

interface TeamProps {
  locale: string;
}

export default function Team({ locale }: TeamProps) {
  const t = getContent(locale).team;

  return (
    <section id="team" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">{t.title}</h2>
        <p className="text-xl text-gray-600 text-center mb-16">{t.subtitle}</p>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Ольга Санамян */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-gray-200">
            <div className="aspect-[3/4] max-w-sm mx-auto rounded-xl overflow-hidden bg-slate-200 mb-6">
              <img
                src="/Sanamyan_Olga.png"
                alt={t.olga.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-2">{t.olga.name}</h3>
            <p className="text-amber-600 font-semibold text-center mb-4">{t.olga.role}</p>
            <p className="text-gray-600 text-center mb-2">{t.olga.spec}</p>
            <p className="text-gray-500 text-center text-sm mb-4">{t.olga.exp}</p>
            <div className="space-y-1">
              <a
                href={`tel:${t.olga.phone.replace(/\D/g, '')}`}
                className="block text-center text-slate-900 font-semibold hover:text-amber-600 transition-colors"
              >
                {t.olga.phone}
              </a>
              {t.olga.phone2 && (
                <a
                  href={`tel:${t.olga.phone2.replace(/\D/g, '')}`}
                  className="block text-center text-slate-900 font-semibold hover:text-amber-600 transition-colors"
                >
                  {t.olga.phone2}
                </a>
              )}
              {t.olga.email && (
                <a
                  href={`mailto:${t.olga.email}`}
                  className="block text-center text-gray-600 hover:text-amber-600 transition-colors text-sm"
                >
                  {t.olga.email}
                </a>
              )}
            </div>
          </div>

          {/* Юсупова Катерина */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-gray-200">
            <div className="aspect-[3/4] max-w-sm mx-auto rounded-xl overflow-hidden bg-slate-200 mb-6">
              <img
                src="/Yusupova_Katerina.jpg"
                alt={t.kateryna.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-2">{t.kateryna.name}</h3>
            <p className="text-amber-600 font-semibold text-center mb-4">{t.kateryna.role}</p>
            <p className="text-gray-600 text-center mb-2">{t.kateryna.spec}</p>
            <p className="text-gray-500 text-center text-sm mb-4">{t.kateryna.exp}</p>
            <a
              href={`tel:${t.kateryna.phone.replace(/\D/g, '')}`}
              className="block text-center text-slate-900 font-semibold hover:text-amber-600 transition-colors mb-2"
            >
              {t.kateryna.phone}
            </a>
            {t.kateryna.phone2 && (
              <a
                href={`tel:${t.kateryna.phone2.replace(/\D/g, '')}`}
                className="block text-center text-slate-900 font-semibold hover:text-amber-600 transition-colors mb-2"
              >
                {t.kateryna.phone2}
              </a>
            )}
            {t.kateryna.email && (
              <a
                href={`mailto:${t.kateryna.email}`}
                className="block text-center text-gray-600 hover:text-amber-600 transition-colors text-sm"
              >
                {t.kateryna.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
