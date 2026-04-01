# Сайт адвокатського об'єднання — Ю.Р.С.П.

**Live:** [https://notguilty-legal.com](https://notguilty-legal.com) | [English version](./README.md)

Лендинг з формою захоплення заявок та адмін-панеллю для адвокатського об'єднання у Києві. Багатомовний (UA/RU), адаптивний, з автоматизованим пайплайном обробки заявок.

![Tech Stack](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-06B6D4?style=flat&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)

## Можливості

- **Багатомовний лендинг** — українська/російська з роутингом за локаллю
- **Форма захоплення лідів** — валідація, захист від спаму (rate limiting), real-time обробка
- **Автоматичні сповіщення** — Telegram Bot API, email через Resend, зберігання в Google Sheets
- **Адмін-панель** — JWT-аутентифікація з IP-binding для безпечного доступу
- **Відказостійкість** — Circuit Breaker для обробки збоїв зовнішніх API
- **Production Ready** — кастомний домен, SSL, DNS через Cloudflare + деплой на Vercel

## Стек технологій

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Адаптивний дизайн

**Backend:**
- Next.js API Routes
- JWT Authentication (jsonwebtoken)
- Rate limiting (Upstash Redis)
- Валідація вхідних даних & захист від XSS

**Інтеграції:**
- Telegram Bot API (миттєві сповіщення)
- Google Sheets API (зберігання заявок)
- Resend (email-сповіщення)
- Upstash Redis (rate limiting)

**Інфраструктура:**
- Vercel (хостинг та деплой)
- Cloudflare (домен, DNS, SSL)

## Структура проєкту

```
app/
├── [locale]/           # i18n роутинг (ua, ru)
│   ├── sections/       # Секції сторінки (Hero, Services, Team тощо)
│   ├── api/            # API маршрути
│   │   ├── contact/    # Ендпоінт відправки форми
│   │   ├── admin/      # Ендпоінти авторизації адмінки
│   │   └── ...
│   └── page.tsx        # Головна сторінка
├── lib/
│   ├── auth/           # JWT утиліти
│   ├── providers/      # Клієнти зовнішніх API
│   └── services/       # Бізнес-логіка
components/             # Спільні компоненти
public/                 # Статичні ресурси
```

## Ключові деталі реалізації

### Безпека
- JWT токени з 3-годинним терміном дії та IP-binding
- Rate limiting: 5 запитів на 15 хвилин з одного IP
- Circuit Breaker для відказостійкості зовнішніх API
- Захист від XSS та валідація вхідних даних

### Пайплайн обробки форм
1. Клієнт відправляє форму → валідація
2. Перевірка rate limiting (Redis)
3. Паралельні сповіщення:
   - Telegram (миттєво)
   - Google Sheets (CRM)
   - Email (резерв)
4. Circuit Breaker обробляє збої gracefully

### Доступ до адмінки
- Маршрут `/admin` з JWT-захистом API
- Токен включає IP користувача — анулюється при зміні IP
- 3-годинна сесія

## Локальна розробка

```bash
# Встановлення залежностей
npm install

# Налаштування змінних оточення
# Скопіюй .env.example в .env.local та заповни:
# - JWT_SECRET
# - TELEGRAM_BOT_TOKEN
# - TELEGRAM_CHAT_IDS (через кому)
# - UPSTASH_REDIS_REST_URL
# - UPSTASH_REDIS_REST_TOKEN
# - GOOGLE_SHEETS_ID
# - GOOGLE_SERVICE_ACCOUNT_KEY
# - RESEND_API_KEY

# Запуск dev-сервера
npm run dev
```

## Деплой

1. Підключи GitHub репозиторій до Vercel
2. Додай змінні оточення в Vercel Dashboard
3. Налаштуй кастомний домен у Cloudflare
4. Деплой при push в `main`

## Інші файли

| Файл | Призначення |
|------|-------------|
| `AGENTS.md` | Правила для AI-асистентів кодування |
| `CLAUDE.md` | Посилання на AGENTS.md для Claude AI |
| `.env.example` | Приклад змінних оточення |
| `README.md` | [English version of documentation](./README.md) |

## Ліцензія

Private — комерційний проєкт для адвокатського об'єднання Ю.Р.С.П.
