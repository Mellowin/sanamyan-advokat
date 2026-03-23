interface FooterProps {
  locale: string;
}

const content = {
  ua: {
    rights: '© 2026 Адвокатське об\'єднання. Всі права захищені.',
    privacy: 'Політика конфіденційності'
  },
  ru: {
    rights: '© 2026 Адвокатское объединение. Все права защищены.',
    privacy: 'Политика конфиденциальности'
  }
};

export default function Footer({ locale }: FooterProps) {
  const t = content[locale as keyof typeof content] || content.ua;

  return (
    <footer className="bg-slate-950 text-gray-500 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>{t.rights}</div>
        <a href="#" className="hover:text-white transition-colors">{t.privacy}</a>
      </div>
    </footer>
  );
}
