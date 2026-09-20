import { getContent } from '@/lib/content';

interface StatsProps {
  locale: string;
}

export default function Stats({ locale }: StatsProps) {
  const items = getContent(locale).stats;

  return (
    <section className="bg-amber-500 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {items.map((item, index) => (
            <div key={index} className="text-slate-900">
              {item.image ? (
                <img src={item.image} alt="" className="h-20 md:h-24 w-auto mx-auto mb-2 object-contain" />
              ) : item.compact ? (
                <div className="text-2xl sm:text-3xl md:text-4xl leading-tight font-bold mb-2 break-words">{item.number}</div>
              ) : (
                <div className="text-5xl sm:text-6xl md:text-8xl leading-none font-bold mb-2">{item.number}</div>
              )}
              {item.label && <div className="font-medium opacity-80">{item.label}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
