import { getContent } from '@/lib/content';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const t = getContent(locale).footer;

  return (
    <footer className="bg-slate-950 text-gray-500 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>{t.rights}</div>
        <a href="#" className="hover:text-white transition-colors">{t.privacy}</a>
      </div>
    </footer>
  );
}
