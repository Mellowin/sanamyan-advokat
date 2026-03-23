'use client';

import { useState } from 'react';

interface ContactProps {
  locale: string;
}

const content = {
  ua: {
    title: 'Контакти',
    subtitle: 'Зв\'яжіться з нами будь-яким зручним способом',
    phone: 'Телефон',
    email: 'Email',
    address: 'Адреса',
    addressValue: 'м. Київ, вул. Парково-Сирецька (Тимофія Шамрила), 21',
    messengers: 'Мессенджери',
    formTitle: 'Або залиште заявку — ми передзвонимо',
    formName: 'Ваше ім\'я',
    formPhone: 'Телефон',
    formMessage: 'Повідомлення',
    formSubmit: 'Відправити',
    formSending: 'Відправка...',
    formSuccess: 'Дякуємо! Ми отримали заявку.',
    formError: 'Помилка. Спробуйте ще раз або зателефонуйте.',
    workingHours: 'Графік роботи: Пн-Пт 9:00-18:00'
  },
  ru: {
    title: 'Контакты',
    subtitle: 'Свяжитесь с нами любым удобным способом',
    phone: 'Телефон',
    email: 'Email',
    address: 'Адрес',
    addressValue: 'г. Киев, ул. Парково-Сырецкая (Тимофея Шамрила), 21',
    messengers: 'Мессенджеры',
    formTitle: 'Или оставьте заявку — мы перезвоним',
    formName: 'Ваше имя',
    formPhone: 'Телефон',
    formMessage: 'Сообщение',
    formSubmit: 'Отправить',
    formSending: 'Отправка...',
    formSuccess: 'Спасибо! Мы получили заявку.',
    formError: 'Ошибка. Попробуйте еще раз или позвоните.',
    workingHours: 'График работы: Пн-Пт 9:00-18:00'
  }
};

export default function Contact({ locale }: ContactProps) {
  const t = content[locale as keyof typeof content] || content.ua;
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          locale
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Номер телефона без + для ссылок
  const phoneNumber = '380987208301';

  return (
    <section id="contact" className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">{t.title}</h2>
        <p className="text-center text-gray-400 mb-16">{t.subtitle}</p>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 text-2xl">📞</div>
              <div>
                <div className="text-sm text-gray-400">{t.phone}</div>
                <a href="tel:+380987208301" className="text-xl font-bold hover:text-amber-500 transition-colors">+38 (098) 720-83-01</a>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 text-2xl">✉️</div>
              <div>
                <div className="text-sm text-gray-400">{t.email}</div>
                <a href="mailto:OSanamyan@ukr.net" className="text-xl font-bold hover:text-amber-500 transition-colors">OSanamyan@ukr.net</a>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 text-2xl">📍</div>
              <div>
                <div className="text-sm text-gray-400">{t.address}</div>
                <div className="text-xl font-bold">{t.addressValue}</div>
              </div>
            </div>

            {/* Мессенджеры */}
            <div className="pt-4">
              <div className="text-sm text-gray-400 mb-3">{t.messengers}</div>
              <div className="flex gap-3">
                {/* Telegram */}
                <a 
                  href={`https://t.me/+${phoneNumber}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition-transform shadow-lg"
                  title="Telegram"
                >
                  TG
                </a>
                {/* WhatsApp */}
                <a 
                  href={`https://wa.me/${phoneNumber}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition-transform shadow-lg"
                  title="WhatsApp"
                >
                  WA
                </a>
                {/* Viber */}
                <a 
                  href={`viber://chat?number=%2B${phoneNumber}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[#7360f2] rounded-full flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition-transform shadow-lg"
                  title="Viber"
                >
                  VB
                </a>
              </div>
            </div>
            
            <div className="pt-4 text-gray-400">
              {t.workingHours}
            </div>
          </div>

          <div className="bg-white text-slate-900 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-6">{t.formTitle}</h3>
            
            {status === 'success' ? (
              <div className="text-center py-8 text-green-600 font-semibold text-lg">
                ✅ {t.formSuccess}
              </div>
            ) : status === 'error' ? (
              <div className="text-center py-8">
                <p className="text-red-600 font-semibold mb-4">{t.formError}</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="text-amber-600 underline hover:no-underline"
                >
                  {locale === 'ua' ? 'Спробувати ще раз' : 'Попробовать еще раз'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.formName}
                  required
                  disabled={status === 'sending'}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none disabled:bg-gray-100"
                />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t.formPhone}
                  required
                  disabled={status === 'sending'}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none disabled:bg-gray-100"
                />
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t.formMessage}
                  rows={3}
                  disabled={status === 'sending'}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none disabled:bg-gray-100"
                />
                <button 
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-3 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? t.formSending : t.formSubmit}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
