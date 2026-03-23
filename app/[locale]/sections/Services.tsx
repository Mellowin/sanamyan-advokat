interface ServicesProps {
  locale: string;
}

const content = {
  ua: {
    title: 'Юридичні послуги',
    forIndividuals: 'Для фізичних осіб',
    forBusiness: 'Для бізнесу',
    individuals: [
      { icon: '👨‍👩‍👧', title: 'Сімейне право', desc: 'Розлучення, аліменти, поділ майна' },
      { icon: '💼', title: 'Трудові спори', desc: 'Незаконне звільнення, стягнення зарплати' },
      { icon: '📜', title: 'Спадщина', desc: 'Оформлення спадщини, заповіти, спори' },
      { icon: '🚗', title: 'ДТП та страхування', desc: 'Відшкодування збитків, ОСЦПВ' },
      { icon: '🏠', title: 'Нерухомість', desc: 'Купівля-продаж, оформлення документів' },
      { icon: '⚖️', title: 'Захист у суді', desc: 'Представництво в судах всіх інстанцій' }
    ],
    business: [
      { icon: '🏢', title: 'Реєстрація бізнесу', desc: 'ТОВ, ФОП, ГО — швидко та під ключ' },
      { icon: '📝', title: 'Договірна робота', desc: 'Розробка та перевірка договорів' },
      { icon: '🏗️', title: 'Будівництво', desc: 'Дозволи, сертифікати, супровід' },
      { icon: '💰', title: 'Податкові спори', desc: 'Оскарження податкових перевірок' },
      { icon: '🤝', title: 'Корпоративні спори', desc: 'Захист інтересів власників' },
      { icon: '📋', title: 'Юридичний аутсорсинг', desc: 'Постійний супровід бізнесу' }
    ]
  },
  ru: {
    title: 'Юридические услуги',
    forIndividuals: 'Для физических лиц',
    forBusiness: 'Для бизнеса',
    individuals: [
      { icon: '👨‍👩‍👧', title: 'Семейное право', desc: 'Развод, алименты, раздел имущества' },
      { icon: '💼', title: 'Трудовые споры', desc: 'Незаконное увольнение, взыскание зарплаты' },
      { icon: '📜', title: 'Наследство', desc: 'Оформление наследства, завещания, споры' },
      { icon: '🚗', title: 'ДТП и страхование', desc: 'Возмещение ущерба, ОСАГО' },
      { icon: '🏠', title: 'Недвижимость', desc: 'Купля-продажа, оформление документов' },
      { icon: '⚖️', title: 'Защита в суде', desc: 'Представительство в судах всех инстанций' }
    ],
    business: [
      { icon: '🏢', title: 'Регистрация бизнеса', desc: 'ООО, ИП, НКО — быстро и под ключ' },
      { icon: '📝', title: 'Договорная работа', desc: 'Разработка и проверка договоров' },
      { icon: '🏗️', title: 'Строительство', desc: 'Разрешения, сертификаты, сопровождение' },
      { icon: '💰', title: 'Налоговые споры', desc: 'Обжалование налоговых проверок' },
      { icon: '🤝', title: 'Корпоративные споры', desc: 'Защита интересов владельцев' },
      { icon: '📋', title: 'Юридический аутсорсинг', desc: 'Постоянное сопровождение бизнеса' }
    ]
  }
};

export default function Services({ locale }: ServicesProps) {
  const t = content[locale as keyof typeof content] || content.ua;

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">{t.title}</h2>
        
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-slate-800 mb-8 text-center">{t.forIndividuals}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {t.individuals.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h4>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-slate-800 mb-8 text-center">{t.forBusiness}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {t.business.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h4>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
