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
    messengers: 'Месенджери',
    formTitle: 'Залиште заявку на консультацію',
    formSubtitle: 'Коротко опишіть вашу ситуацію — ми зв\'яжемося з вами та підкажемо подальші кроки.',
    formName: 'Ваше ім\'я',
    formPhone: 'Телефон',
    formMessage: 'Опишіть ситуацію',
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
    formTitle: 'Оставьте заявку на консультацию',
    formSubtitle: 'Кратко опишите вашу ситуацию — мы свяжемся с вами и подскажем дальнейшие шаги.',
    formName: 'Ваше имя',
    formPhone: 'Телефон',
    formMessage: 'Опишите ситуацию',
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

  // Валидация телефона
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\+\-\(\)\s]+$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digitsOnly.length >= 10;
  };

  // XSS проверка
  const hasXss = (input: string): boolean => {
    const xssPattern = /<script|javascript:|onerror=|onload=|<iframe|<object|<embed|alert\(|confirm\(|prompt\(/i;
    return xssPattern.test(input);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Предотвращаем повторную отправку
    if (status === 'sending') return;
    
    // Проверка телефона перед отправкой
    if (!isValidPhone(formData.phone)) {
      alert(locale === 'ua' 
        ? 'Введіть коректний номер телефону (тільки цифри, +, -, ())' 
        : 'Введите корректный номер телефона (только цифры, +, -, ())');
      return;
    }

    // Проверка на XSS
    if (hasXss(formData.name) || hasXss(formData.message)) {
      alert(locale === 'ua' 
        ? 'Виявлено заборонені символи' 
        : 'Обнаружены запрещенные символы');
      return;
    }
    
    setStatus('sending');

    try {
      // Генерируем уникальный ID для заявки
      const submissionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Submission-ID': submissionId,
        },
        body: JSON.stringify({
          ...formData,
          locale
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', message: '' });
      } else if (response.status === 429) {
        // Rate limit exceeded
        const data = await response.json();
        alert(data.message || 'Забагато заявок. Спробуйте пізніше.');
        setStatus('idle');
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

  // Номера телефонов
  const phoneNumber = '380987208301';
  const phoneDisplay = '+38 (098) 720-83-01';
  const phone2Number = '380509295374';
  const phone2Display = '+38 (050) 929-53-74';
  const phone3Number = '380675860710';
  const phone3Display = '+38 (067) 586-07-10';
  const phone4Number = '380633645587';
  const phone4Display = '+38 (063) 364-55-87';

  // Копирование в буфер обмена (работает всегда)
  const copyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  };

  // Обработка клика по телефону
  const handlePhoneClick = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // На мобильном — звоним
      window.location.href = `tel:${phoneDisplay.replace(/\D/g, '')}`;
    } else {
      // На десктопе — копируем в буфер
      const copied = copyToClipboard(phoneDisplay);
      if (copied) {
        alert(locale === 'ua' ? 'Номер скопійовано!' : 'Номер скопирован!');
      } else {
        alert(locale === 'ua' ? 'Не вдалося скопіювати' : 'Не удалось скопировать');
      }
    }
  };

  return (
    <section id="contact" className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">{t.title}</h2>
        <p className="text-center text-gray-400 mb-16">{t.subtitle}</p>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-slate-900"><img src="/icons/phone.png" alt="" className="w-6 h-6 object-contain" /></div>
              <div>
                <div className="text-sm text-gray-400">{t.phone}</div>
                <button 
                  onClick={handlePhoneClick}
                  className="text-xl font-bold hover:text-amber-500 transition-colors text-left block"
                >
                  {phoneDisplay}
                </button>
                <a 
                  href={`tel:${phone2Number}`}
                  className="text-xl font-bold hover:text-amber-500 transition-colors block"
                >
                  {phone2Display}
                </a>
                <a 
                  href={`tel:${phone3Number}`}
                  className="text-xl font-bold hover:text-amber-500 transition-colors block"
                >
                  {phone3Display}
                </a>
                <a 
                  href={`tel:${phone4Number}`}
                  className="text-xl font-bold hover:text-amber-500 transition-colors block"
                >
                  {phone4Display}
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-slate-900"><img src="/icons/email.png" alt="" className="w-6 h-6 object-contain" /></div>
              <div>
                <div className="text-sm text-gray-400">{t.email}</div>
                <a href="mailto:OSanamyan@ukr.net" className="text-xl font-bold hover:text-amber-500 transition-colors">OSanamyan@ukr.net</a>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-slate-900"><img src="/icons/location.png" alt="" className="w-6 h-6 object-contain" /></div>
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
                  className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  title="Telegram"
                >
                  <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6 object-contain" />
                </a>
                {/* WhatsApp */}
                <a 
                  href={`https://wa.me/${phoneNumber}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  title="WhatsApp"
                >
                  <img src="/icons/whatsapp.png" alt="WhatsApp" className="w-6 h-6 object-contain" />
                </a>
                {/* Viber */}
                <a 
                  href={`viber://chat?number=%2B${phoneNumber}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[#7360f2] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  title="Viber"
                >
                  <img src="/icons/viber.png" alt="Viber" className="w-6 h-6 object-contain" />
                </a>
              </div>
            </div>
            
            <div className="pt-4 text-gray-400">
              {t.workingHours}
            </div>
          </div>

          <div className="bg-white text-slate-900 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-2">{t.formTitle}</h3>
            <p className="text-gray-600 mb-6">{t.formSubtitle}</p>
            
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
                  pattern="[\d\+\-\(\)\s]{10,}"
                  title={locale === 'ua' ? 'Тільки цифри, +, -, ()' : 'Только цифры, +, -, ()'}
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
