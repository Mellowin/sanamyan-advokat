'use client';

import { useState } from 'react';

interface HeroProps {
    locale: string;
}

const content = {
    ua: {
        title: 'Адвокатське об\'єднання',
        subtitle: 'Професійна правова допомога у складних життєвих ситуаціях',
        description: '15+ років досвіду. 500+ успішних справ. Робота по всій Україні.',
        ctaPrimary: 'Безкоштовна консультація',
        ctaSecondary: 'Подзвонити',
        phone: '+38(098)720-83-01',
        formTitle: 'Замовити консультацію',
        formName: 'Ваше ім\'я',
        formPhone: 'Телефон',
        formMessage: 'Опишіть ситуацію',
        formSubmit: 'Відправити',
        formSending: 'Відправка...',
        formSuccess: 'Дякуємо! Ми отримали заявку.',
        formError: 'Помилка. Спробуйте ще раз або зателефонуйте.'
    },
    ru: {
        title: 'Адвокатское объединение',
        subtitle: 'Профессиональная правовая помощь в сложных жизненных ситуациях',
        description: '15+ лет опыта. 500+ успешных дел. Работа по всей Украине.',
        ctaPrimary: 'Бесплатная консультация',
        ctaSecondary: 'Позвонить',
        phone: '+38(098)720-83-01',
        formTitle: 'Заказать консультацию',
        formName: 'Ваше имя',
        formPhone: 'Телефон',
        formMessage: 'Опишите ситуацию',
        formSubmit: 'Отправить',
        formSending: 'Отправка...',
        formSuccess: 'Спасибо! Мы получили заявку.',
        formError: 'Ошибка. Попробуйте еще раз или позвоните.'
    }
};

export default function Hero({ locale }: HeroProps) {
    const t = content[locale as keyof typeof content] || content.ua;
    const [showForm, setShowForm] = useState(false);
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
                setTimeout(() => {
                    setShowForm(false);
                    setStatus('idle');
                }, 3000);
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

    return (
        <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center">
            <div className="container mx-auto px-4 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="mb-4 text-amber-400 font-semibold tracking-wide uppercase text-sm">
                            {locale === 'ua' ? 'Правовий захист' : 'Правовая защита'}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            {t.title}
                        </h1>
                        <p className="text-2xl text-gray-300 mb-4">
                            {t.subtitle}
                        </p>
                        <p className="text-gray-400 mb-8 text-lg">
                            {t.description}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => {
                                    setShowForm(true);
                                    setStatus('idle');
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105"
                            >
                                {t.ctaPrimary}
                            </button>
                            <a
                                href={`tel:${t.phone.replace(/\D/g, '')}`}
                                className="border-2 border-white hover:bg-white hover:text-slate-900 text-white font-semibold px-8 py-4 rounded-lg transition-all"
                            >
                                {t.ctaSecondary}
                            </a>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-slate-800 rounded-2xl p-2 border border-slate-700">
                            <div className="aspect-[3/4] rounded-xl overflow-hidden">
                                <img
                                    src="/Sanamyan_Olga.jpg"
                                    alt={locale === 'ua' ? 'Адвокат' : 'Адвокат'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-white text-slate-900 rounded-2xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold">{t.formTitle}</h3>
                            <button 
                                onClick={() => {
                                    setShowForm(false);
                                    setStatus('idle');
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

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
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setStatus('idle');
                                        }}
                                        className="flex-1 py-3 border rounded-lg hover:bg-gray-100"
                                        disabled={status === 'sending'}
                                    >
                                        {locale === 'ua' ? 'Скасувати' : 'Отмена'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="flex-1 py-3 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                                    >
                                        {status === 'sending' ? t.formSending : t.formSubmit}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
