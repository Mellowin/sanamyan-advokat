'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface HeaderProps {
  locale: string;
}

const content = {
  ua: {
    name: 'Санамян Ольга Олегівна',
    nav: [
      { name: 'Послуги', href: '#services' },
      { name: 'Чому ми', href: '#whyus' },
      { name: 'Відгуки', href: '#reviews' },
      { name: 'FAQ', href: '#faq' },
      { name: 'Контакти', href: '#contact' },
    ],
  },
  ru: {
    name: 'Санамян Ольга Олеговна',
    nav: [
      { name: 'Услуги', href: '#services' },
      { name: 'Почему мы', href: '#whyus' },
      { name: 'Отзывы', href: '#reviews' },
      { name: 'FAQ', href: '#faq' },
      { name: 'Контакты', href: '#contact' },
    ],
  },
};

export default function Header({ locale }: HeaderProps) {
  const pathname = usePathname();
  const otherLocale = locale === 'ua' ? 'ru' : 'ua';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  const switchLocalePath = `/${otherLocale}${pathWithoutLocale}`;
  const t = content[locale as keyof typeof content] || content.ua;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Имя - ссылка на контакты */}
          <a href="#contact" className="text-white font-bold text-lg hover:text-amber-400 transition-colors">
            {t.name}
          </a>

          {/* Десктопная навигация */}
          <nav className="hidden md:flex items-center gap-8">
            {t.nav.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Правая часть: язык + бургер */}
          <div className="flex items-center gap-4">
            {/* Переключатель языка */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm uppercase">{locale}</span>
              <Link
                href={switchLocalePath}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-medium transition-colors border border-slate-700"
              >
                {otherLocale === 'ua' ? 'UA' : 'RU'}
              </Link>
            </div>

            {/* Бургер-меню для мобильных */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-slate-800 py-4">
            {t.nav.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-slate-800 transition-colors text-base font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
