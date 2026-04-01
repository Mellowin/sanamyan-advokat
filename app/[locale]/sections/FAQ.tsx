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
      { q: 'Як проходить перша консультація?', a: 'На консультації ми детально вивчаємо вашу ситуацію, аналізуємо документи та даємо чесну оцінку перспектив. Тривалість — до 1 години.' },
      { q: 'Які документи потрібні для звернення?', a: 'Залежить від типу справи. Зазвичай це паспорт, документи, що підтверджують суть справи, та інші матеріали. Конкретний список сформуємо під час першої розмови.' },
      { q: 'Чи можна оплатити частинами?', a: 'Так, передбачена поетапна оплата. Перший платіж — при підписанні договору, наступні — по мірі виконання робіт.' }
    ]
  },
  ru: {
    title: 'Часто задаваемые вопросы',
    items: [
      { q: 'Сколько стоит консультация?', a: 'Первая консультация бесплатная. Стоимость дальнейшей работы зависит от сложности дела и обсуждается индивидуально.' },
      { q: 'Работаете ли вы по всей Украине?', a: 'Да, мы работаем по всей Украине. Многие вопросы можно решить дистанционно, при необходимости едем к клиенту.' },
      { q: 'Как проходит первая консультация?', a: 'На консультации мы детально изучаем вашу ситуацию, анализируем документы и даем честную оценку перспектив. Продолжительность — до 1 часа.' },
      { q: 'Какие документы нужны для обращения?', a: 'Зависит от типа дела. Обычно это паспорт, документы, подтверждающие суть дела, и другие материалы. Конкретный список сформируем во время первого разговора.' },
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
