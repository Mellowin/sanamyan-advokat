'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { getContent } from '@/lib/content';
import { locales } from '@/lib/i18n/config';

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  const t = getContent(locale).header;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-2 overflow-hidden">
          {/* Имя - ссылка на контакты */}
          <a href="#contact" className="min-w-0 flex-1 truncate text-white font-bold text-sm sm:text-lg hover:text-amber-400 transition-colors">
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

          {/* Правая часть: языки + бургер */}
          <div className="shrink-0 flex items-center gap-2 sm:gap-4">
            {/* Переключатель языков */}
            <div className="flex items-center gap-1 sm:gap-2">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={`/${l}${pathWithoutLocale}`}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium uppercase transition-colors border ${
                    l === locale
                      ? 'bg-amber-500 text-slate-900 border-amber-500'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  }`}
                >
                  {l}
                </Link>
              ))}
            </div>

            {/* Бургер-меню для мобильных */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-1.5 shrink-0"
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
