import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-4">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          {t('hero.subtitle')}
        </p>
        <div className="flex justify-center gap-4">
          <a 
            href="https://t.me/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {t('hero.cta_primary')}
          </a>
          <button className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100">
            {t('hero.cta_secondary')}
          </button>
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-600">📞 {t('contacts.phone')}</p>
          <p className="text-gray-600">📍 {t('contacts.address')}</p>
        </div>
      </div>
    </main>
  );
}
