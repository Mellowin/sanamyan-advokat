interface WhyUsProps {
  locale: string;
}

const content = {
  ua: {
    title: 'Чому обирають нас',
    items: [
      { icon: '🎯', title: 'Робота на результат', desc: 'Ми беремося тільки за ті справи, де можемо гарантувати результат' },
      { icon: '💬', title: 'Прозорість', desc: 'Жодної "води" — тільки конкретика. Ви завжди знаєте, що відбувається з вашою справою' },
      { icon: '⏱️', title: 'Економія часу', desc: 'Вирішуємо питання швидко. Не затягуємо процеси без потреби' },
      { icon: '💰', title: 'Чесна ціна', desc: 'Фіксована вартість або оплата поетапно. Жодних прихованих платежів' }
    ]
  },
  ru: {
    title: 'Почему выбирают нас',
    items: [
      { icon: '🎯', title: 'Работа на результат', desc: 'Беремся только за те дела, где можем гарантировать результат' },
      { icon: '💬', title: 'Прозрачность', desc: 'Никакой "воды" — только конкретика. Вы всегда знаете, что происходит с вашим делом' },
      { icon: '⏱️', title: 'Экономия времени', desc: 'Решаем вопросы быстро. Не затягиваем процессы без нужды' },
      { icon: '💰', title: 'Честная цена', desc: 'Фиксированная стоимость или поэтапная оплата. Никаких скрытых платежей' }
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
