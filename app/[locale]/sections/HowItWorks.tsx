import { getContent } from '@/lib/content';

interface HowItWorksProps {
  locale: string;
}

export default function HowItWorks({ locale }: HowItWorksProps) {
  const t = getContent(locale).howItWorks;

  if (!t) return null;

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">{t.title}</h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">{t.subtitle}</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {t.steps.map((step, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-900 font-bold text-xl flex items-center justify-center mb-4">
                {index + 1}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h4>
              <p className="text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
