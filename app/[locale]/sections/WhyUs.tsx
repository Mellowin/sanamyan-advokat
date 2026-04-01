interface WhyUsProps {
  locale: string;
}

const content = {
  ua: {
    title: 'Чому обирають нас',
    items: [
      { icon: '🎯', title: 'Чесна оцінка перспектив', desc: 'Чесно оцінюємо перспективи справи до початку роботи' },
      { icon: '💬', title: 'Зрозуміла комунікація', desc: 'Пояснюємо ситуацію зрозумілою мовою та тримаємо клієнта в курсі кожного етапу справи' },
      { icon: '⏱️', title: 'Оперативність', desc: 'Працюємо оперативно та без зайвого затягування там, де це залежить від нас' },
      { icon: '💰', title: 'Прозора вартість', desc: 'Формат співпраці та вартість обговорюються до початку роботи' }
    ]
  },
  ru: {
    title: 'Почему выбирают нас',
    items: [
      { icon: '🎯', title: 'Честная оценка перспектив', desc: 'Честно оцениваем перспективы дела до начала работы' },
      { icon: '💬', title: 'Понятная коммуникация', desc: 'Объясняем ситуацию понятным языком и держим клиента в курсе каждого этапа дела' },
      { icon: '⏱️', title: 'Оперативность', desc: 'Работаем оперативно и без лишнего затягивания там, где это зависит от нас' },
      { icon: '💰', title: 'Прозрачная стоимость', desc: 'Формат сотрудничества и стоимость обсуждаются до начала работы' }
    ]
  }
};

export default function WhyUs({ locale }: WhyUsProps) {
  const t = content[locale as keyof typeof content] || content.ua;

  return (
    <section id="whyus" className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">{t.title}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.items.map((item, index) => (
            <div key={index} className="text-center p-6">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
