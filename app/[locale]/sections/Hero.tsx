'use client';

import { useState } from 'react';

interface HeroProps {
    locale: string;
}

const content = {
    ua: {
        title: "Адвокатське об'єднання Ю.Р.С.П. у Києві",
        subtitle: 'Кримінальне право • Сімейне право • Спадкове право • Військове право • ДТП',
        description: '20+ років практики. 5000+ клієнтів. Безкоштовна оцінка ситуації.',
        ctaPrimary: 'Безкоштовна консультація',
        ctaSecondary: 'Подзвонити',
        phone: '+38(098)720-83-01',
        phone2: '+38(050)929-53-74',
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
        title: 'Адвокатское объединение Ю.Р.С.П. в Киеве',
        subtitle: 'Уголовное право • Семейное право • Наследственное право • Военное право • ДТП',
        description: '20+ лет практики. 5000+ клиентов. Бесплатная оценка ситуации.',
        ctaPrimary: 'Бесплатная консультация',
        ctaSecondary: 'Позвонить',
        phone: '+38(098)720-83-01',
        phone2: '+38(050)929-53-74',
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
                setTimeout(() => {
                    setShowForm(false);
                    setStatus('idle');
                }, 3000);
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
                        <div className="flex gap-3 sm:gap-4">
                            <button
                                onClick={() => {
                                    setShowForm(true);
                                    setStatus('idle');
                                }}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 sm:px-8 py-3 sm:py-4 rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base"
                            >
                                {t.ctaPrimary}
                            </button>
                            <button
                                onClick={() => {
                                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                                    if (isMobile) {
                                        window.location.href = `tel:${t.phone.replace(/\D/g, '')}`;
                                    } else {
                                        // Копирование в буфер
                                        const textarea = document.createElement('textarea');
                                        textarea.value = t.phone;
                                        textarea.style.position = 'fixed';
                                        textarea.style.opacity = '0';
                                        document.body.appendChild(textarea);
                                        textarea.select();
                                        try {
                                            document.execCommand('copy');
                                            alert(locale === 'ua' ? 'Номер скопійовано!' : 'Номер скопирован!');
                                        } catch (err) {
                                            alert(locale === 'ua' ? 'Не вдалося скопіювати' : 'Не удалось скопировать');
                                        }
                                        document.body.removeChild(textarea);
                                    }
                                }}
                                className="flex-1 border-2 border-white hover:bg-white hover:text-slate-900 text-white font-semibold px-4 sm:px-8 py-3 sm:py-4 rounded-lg transition-all text-sm sm:text-base"
                            >
                                {t.ctaSecondary}
                            </button>
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
