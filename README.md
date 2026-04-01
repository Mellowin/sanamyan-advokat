# Ю.Р.С.П. — Law Firm Website / Сайт адвокатського об'єднання

**Live:** [https://notguilty-legal.com](https://notguilty-legal.com)

Landing page with lead capture form and admin panel for a Kyiv-based law firm. Multilingual (UA/RU), responsive, with automated lead processing pipeline.

---

## English

### Features
- **Multilingual Landing Page** — Ukrainian/Russian with locale-based routing
- **Lead Capture Form** — validation, spam protection (rate limiting), real-time processing
- **Automated Notifications** — Telegram Bot API, email via Resend, Google Sheets storage
- **Admin Panel** — JWT authentication with IP-binding for secure access
- **Resilience** — Circuit Breaker pattern for handling external API failures
- **Production Ready** — custom domain, SSL, DNS via Cloudflare + Vercel deployment

### Tech Stack
**Frontend:** Next.js 16, TypeScript, Tailwind CSS  
**Backend:** Next.js API Routes, JWT Auth, Upstash Redis  
**Integrations:** Telegram Bot API, Google Sheets, Resend  
**Infrastructure:** Vercel, Cloudflare

---

## Українська

### Можливості
- **Багатомовний лендинг** — українська/російська з роутингом за локаллю
- **Форма захоплення лідів** — валідація, захист від спаму (rate limiting), real-time обробка
- **Автоматичні сповіщення** — Telegram Bot API, email через Resend, зберігання в Google Sheets
- **Адмін-панель** — JWT-аутентифікація з IP-binding для безпечного доступу
- **Відказостійкість** — Circuit Breaker для обробки збоїв зовнішніх API
- **Production Ready** — кастомний домен, SSL, DNS через Cloudflare + деплой на Vercel

### Стек технологій
**Frontend:** Next.js 16, TypeScript, Tailwind CSS  
**Backend:** Next.js API Routes, JWT Auth, Upstash Redis  
**Інтеграції:** Telegram Bot API, Google Sheets, Resend  
**Інфраструктура:** Vercel, Cloudflare

---

## Project Structure / Структура проєкту

```
app/
├── [locale]/           # i18n routing (ua, ru)
│   ├── sections/       # Page sections (Hero, Services, Team, etc.)
│   ├── api/            # API routes
│   │   ├── contact/    # Form submission endpoint
│   │   ├── admin/      # Admin auth endpoints
│   │   └── ...
│   └── page.tsx        # Main page
├── lib/
│   ├── auth/           # JWT utilities
│   ├── providers/      # External API clients
│   └── services/       # Business logic
components/             # Shared components
public/                 # Static assets
```

---

## Key Implementation Details / Ключові деталі реалізації

### Security / Безпека
- JWT tokens with 3-hour expiration and IP-binding
- Rate limiting: 5 requests per 15 minutes per IP
- Circuit Breaker for external API resilience
- XSS protection and input validation

### Form Processing Pipeline / Пайплайн обробки форм
1. Client submits form → validation
2. Rate limiting check (Redis)
3. Parallel notifications: Telegram (instant), Google Sheets (CRM), Email (backup)
4. Circuit Breaker handles failures gracefully

### Admin Access / Доступ до адмінки
- `/admin` route with JWT-protected API
- Token includes user IP — invalidated if IP changes
- 3-hour session expiration

---

## Local Development / Локальна розробка

```bash
# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env.local and fill in:
# - JWT_SECRET
# - TELEGRAM_BOT_TOKEN
# - TELEGRAM_CHAT_IDS (comma-separated)
# - UPSTASH_REDIS_REST_URL
# - UPSTASH_REDIS_REST_TOKEN
# - GOOGLE_SHEETS_ID
# - GOOGLE_SERVICE_ACCOUNT_KEY
# - RESEND_API_KEY

# Run dev server
npm run dev
```

---

## Deployment / Деплой

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel Dashboard
3. Configure custom domain in Cloudflare
4. Deploy on push to `main`

---

## Other Files / Інші файли

| File | Purpose / Призначення |
|------|----------------------|
| `AGENTS.md` | Next.js agent rules for AI coding assistants / Правила для AI-асистентів кодування |
| `CLAUDE.md` | Reference to AGENTS.md for Claude AI / Посилання на AGENTS.md для Claude AI |
| `GOOGLE_SHEETS_SETUP.md` | Setup guide for Google Sheets integration / Інструкція налаштування Google Sheets |
| `RESEND_SETUP.md` | Setup guide for Resend email service / Інструкція налаштування сервісу Resend |
| `.env.example` | Example environment variables / Приклад змінних оточення |

---

## License / Ліцензія

Private — commercial project for Ю.Р.С.П. law firm.
