import { getContent } from '@/lib/content';

interface ReviewsProps {
  locale: string;
}

export default function Reviews({ locale }: ReviewsProps) {
  const t = getContent(locale).reviews;

  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">{t.title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {t.items.map((review, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="text-amber-500 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-700 mb-4 italic">{'"'}{review.text}{'"'}</p>
              <div className="font-bold text-slate-900">{review.name}</div>
              <div className="text-sm text-gray-500">{review.service}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
