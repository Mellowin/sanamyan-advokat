interface ServicesProps {
  locale: string;
}

const content = {
  ua: {
    title: 'Юридичні послуги',
    subtitle: 'Основні напрямки роботи',
    services: [
      { icon: '⚖️', title: 'Кримінальне право', desc: 'Захист підозрюваних, обвинувачених, потерпілих. Консультація від 1500 грн' },
      { icon: '⚔️', title: 'Військове право', desc: 'Відстрочка, звільнення, оскарження рішень ТЦК. Консультація від 1000 грн' },
      { icon: '👨‍👩‍👧', title: 'Сімейне право', desc: 'Розірвання шлюбу, розподіл майна подружжя, стягнення аліментів, неустойки (пені), визначення місця проживання дитини/дітей, позбавлення батьківських прав, усиновлення, скасування та інше. Консультація від 1000 грн' },
      { icon: '📜', title: 'Спадкове право', desc: 'Оформлення спадщини, заповіти, спори. Консультація від 1000 грн' },
      { icon: '🚗', title: 'ДТП', desc: 'Відшкодування збитків, захист прав, ОСЦПВ. Консультація від 1000 грн' }
    ]
  },
  ru: {
    title: 'Юридические услуги',
    subtitle: 'Основные направления работы',
    services: [
      { icon: '⚖️', title: 'Уголовное право', desc: 'Защита подозреваемых, обвиняемых, потерпевших. Консультация от 1500 грн' },
      { icon: '⚔️', title: 'Военное право', desc: 'Отсрочка, освобождение, обжалование решений ТЦК. Консультация от 1000 грн' },
      { icon: '👨‍👩‍👧', title: 'Семейное право', desc: 'Расторжение брака, раздел имущества супругов, взыскание алиментов, неустойка (пени), определение места жительства ребенка/детей, лишение родительских прав, усыновление, отмена решений и другое. Консультация от 1000 грн' },
      { icon: '📜', title: 'Наследственное право', desc: 'Оформление наследства, завещания, споры. Консультация от 1000 грн' },
      { icon: '🚗', title: 'ДТП', desc: 'Возмещение ущерба, защита прав, ОСАГО. Консультация от 1000 грн' }
    ]
  }
};

export default function Services({ locale }: ServicesProps) {
  const t = content[locale as keyof typeof content] || content.ua;

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">{t.title}</h2>
        <p className="text-xl text-gray-600 text-center mb-16">{t.subtitle}</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {t.services.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h4>
              <p className="text-gray-600">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
