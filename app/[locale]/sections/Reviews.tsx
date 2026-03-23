interface ReviewsProps {
  locale: string;
}

const content = {
  ua: {
    title: 'Відгуки клієнтів',
    reviews: [
      { name: 'Олександр К.', text: 'Допомогли повернути борг, який не повертали 2 роки. Справа вирішена за 3 місяці. Рекомендую!', service: 'Стягнення боргу' },
      { name: 'Марія С.', text: 'Професійний підхід до сімейного спору. Все вирішили мирно, без зайвих нервів і витрат.', service: 'Сімейне право' },
      { name: 'ТОВ "Прогрес"', text: 'Супровід угоди з нерухомістю на 2 млн грн. Все перевірили, документи в порядку. Спасибі!', service: 'Нерухомість' }
    ]
  },
  ru: {
    title: 'Отзывы клиентов',
    reviews: [
      { name: 'Александр К.', text: 'Помогли вернуть долг, который не возвращали 2 года. Дело решено за 3 месяца. Рекомендую!', service: 'Взыскание долга' },
      { name: 'Мария С.', text: 'Профессиональный подход к семейному спору. Все решили мирно, без лишних нервов и затрат.', service: 'Семейное право' },
      { name: 'ООО "Прогресс"', text: 'Сопровождение сделки с недвижимостью на 2 млн грн. Все проверили, документы в порядке. Спасибо!', service: 'Недвижимость' }
    ]
  }
};

export default function Reviews({ locale }: ReviewsProps) {
  const t = content[locale as keyof typeof content] || content.ua;

  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">{t.title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {t.reviews.map((review, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="text-amber-500 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
              <div className="font-bold text-slate-900">{review.name}</div>
              <div className="text-sm text-gray-500">{review.service}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
