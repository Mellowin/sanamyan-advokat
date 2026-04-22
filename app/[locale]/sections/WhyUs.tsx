interface WhyUsProps {
  locale: string;
}

const content = {
  ua: {
    title: 'Чому обирають нас',
    items: [
      { icon: '/icons/target.png', title: 'Чесна оцінка перспектив', desc: 'Чесно оцінюємо перспективи справи до початку роботи' },
      { icon: '/icons/communication.png', title: 'Зрозуміла комунікація', desc: 'Пояснюємо ситуацію зрозумілою мовою та тримаємо клієнта в курсі справи' },
      { icon: '/icons/moneybag.png', title: 'Прозора вартість', desc: 'Формат співпраці та вартість обговорюються до початку роботи' }
    ]
  },
  ru: {
    title: 'Почему выбирают нас',
    items: [
      { icon: '/icons/target.png', title: 'Честная оценка перспектив', desc: 'Честно оцениваем перспективы дела до начала работы' },
      { icon: '/icons/communication.png', title: 'Понятная коммуникация', desc: 'Объясняем ситуацию понятным языком и держим клиента в курсе дела' },
      { icon: '/icons/moneybag.png', title: 'Прозрачная стоимость', desc: 'Формат сотрудничества и стоимость обсуждаются до начала работы' }
    ]
  }
};

export default function WhyUs({ locale }: WhyUsProps) {
  const t = content[locale as keyof typeof content] || content.ua;

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
