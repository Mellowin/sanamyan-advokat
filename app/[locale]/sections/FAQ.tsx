'use client';

import { useState } from 'react';

interface FAQProps {
  locale: string;
}

const content = {
  ua: {
    title: 'Часті питання',
    items: [
      { q: 'Скільки коштує консультація?', a: 'Перша консультація безкоштовна. Вартість подальшої роботи залежить від складності справи та обговорюється індивідуально.' },
      { q: 'Чи працюєте ви по всій Україні?', a: 'Так, ми працюємо по всій Україні. Багато питань можна вирішити дистанційно, при необхідності їдемо до клієнта.' },
      { q: 'Які гарантії результату?', a: 'Ми беремося тільки за ті справи, де бачимо реальну перспективу успіху. Перед початком роботи даємо чесну оцінку шансів.' },
      { q: 'Скільки триватиме справа?', a: 'Термін залежить від типу справи та завантаженості судів. Сімейні спори — 1-3 місяці, господарські — від 3 місяців.' },
      { q: 'Чи можна оплатити частинами?', a: 'Так, передбачена поетапна оплата. Перший платіж — при підписанні договору, наступні — по мірі виконання робіт.' }
    ]
  },
  ru: {
    title: 'Часто задаваемые вопросы',
    items: [
      { q: 'Сколько стоит консультация?', a: 'Первая консультация бесплатная. Стоимость дальнейшей работы зависит от сложности дела и обсуждается индивидуально.' },
      { q: 'Работаете ли вы по всей Украине?', a: 'Да, мы работаем по всей Украине. Многие вопросы можно решить дистанционно, при необходимости едем к клиенту.' },
      { q: 'Какие гарантии результата?', a: 'Мы беремся только за те дела, где видим реальную перспективу успеха. Перед началом работы даем честную оценку шансов.' },
      { q: 'Сколько продлится дело?', a: 'Срок зависит от типа дела и загруженности судов. Семейные споры — 1-3 месяца, хозяйственные — от 3 месяцев.' },
      { q: 'Можно ли оплатить частями?', a: 'Да, предусмотрена поэтапная оплата. Первый платеж — при подписании договора, следующие — по мере выполнения работ.' }
    ]
  }
};

export default function FAQ({ locale }: FAQProps) {
  const t = content[locale as keyof typeof content] || content.ua;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">{t.title}</h2>
        <div className="space-y-4">
          {t.items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-slate-900">{item.q}</span>
                <span className="text-2xl text-gray-400 transform transition-transform">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
