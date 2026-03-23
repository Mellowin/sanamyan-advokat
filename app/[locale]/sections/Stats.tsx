interface StatsProps {
  locale: string;
}

const stats = {
  ua: [
    { number: '15+', label: 'років досвіду' },
    { number: '500+', label: 'виграних справ' },
    { number: '98%', label: 'успішних кейсів' },
    { number: '24/7', label: 'підтримка' }
  ],
  ru: [
    { number: '15+', label: 'лет опыта' },
    { number: '500+', label: 'выигранных дел' },
    { number: '98%', label: 'успешных кейсов' },
    { number: '24/7', label: 'поддержка' }
  ]
};

export default function Stats({ locale }: StatsProps) {
  const items = stats[locale as keyof typeof stats] || stats.ua;

  return (
    <section className="bg-amber-500 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {items.map((item, index) => (
            <div key={index} className="text-slate-900">
              <div className="text-4xl md:text-5xl font-bold mb-2">{item.number}</div>
              <div className="font-medium opacity-80">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
