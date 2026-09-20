import { getContent } from '@/lib/content';

interface ServicesProps {
  locale: string;
}

export default function Services({ locale }: ServicesProps) {
  const t = getContent(locale).services;

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">{t.title}</h2>
        <p className="text-xl text-gray-600 text-center mb-16">{t.subtitle}</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {t.items.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <img src={service.icon} alt="" className="w-32 h-32 mb-4 object-contain" />
              <h4 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h4>
              <ul className="space-y-1.5">
                {service.items.map((item, i) => (
                  <li key={i} className="text-gray-600 flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
