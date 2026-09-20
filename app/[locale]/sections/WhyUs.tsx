import { getContent } from '@/lib/content';

interface WhyUsProps {
  locale: string;
}

export default function WhyUs({ locale }: WhyUsProps) {
  const t = getContent(locale).whyUs;

  return (
    <section id="whyus" className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">{t.title}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.items.map((item, index) => (
            <div key={index} className="text-center p-6">
              <img src={item.icon} alt="" className="w-32 h-32 mx-auto mb-4 object-contain" />
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
