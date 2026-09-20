'use client';

import { useState } from 'react';
import { getContent } from '@/lib/content';

interface FAQProps {
  locale: string;
}

export default function FAQ({ locale }: FAQProps) {
  const t = getContent(locale).faq;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">{t.title}</h2>
        <div className="space-y-4">
          {t.items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-slate-900">{item.q}</span>
                <span className="text-2xl text-gray-400 transform transition-transform">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
