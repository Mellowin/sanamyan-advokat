interface StatsProps {
  locale: string;
}

const stats = {
  ua: [
    { number: '20+', label: 'років досвіду' },
    { number: '5000+', label: 'клієнтів' },
    { number: '24/7', label: 'підтримка' },
    { number: '🔒', label: 'конфіденційний супровід' }
  ],
  ru: [
    { number: '20+', label: 'лет опыта' },
    { number: '5000+', label: 'клиентов' },
    { number: '24/7', label: 'поддержка' },
    { number: '🔒', label: 'конфиденциальное сопровождение' }
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
