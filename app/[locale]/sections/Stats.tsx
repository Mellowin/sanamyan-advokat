interface StatsProps {
  locale: string;
}

const stats = {
  ua: [
    { number: '20+', label: 'років досвіду' },
    { number: '5000+', label: 'клієнтів' },
    { number: '24/7', label: 'підтримка' },
    { image: '/icons/confidentiality.png', label: 'конфіденційний супровід' }
  ],
  ru: [
    { number: '20+', label: 'лет опыта' },
    { number: '5000+', label: 'клиентов' },
    { number: '24/7', label: 'поддержка' },
    { image: '/icons/confidentiality.png', label: 'конфиденциальное сопровождение' }
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
              {item.image ? (
                <img src={item.image} alt="" className="h-20 md:h-24 w-auto mx-auto mb-2 object-contain" />
              ) : (
                <div className="text-7xl md:text-8xl leading-none font-bold mb-2">{item.number}</div>
              )}
              {item.label && <div className="font-medium opacity-80">{item.label}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
