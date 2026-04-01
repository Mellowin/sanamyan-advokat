# Law Firm Website — Ю.Р.С.П.

**Live:** [https://notguilty-legal.com](https://notguilty-legal.com) | [Українська версія](./README_UA.md)

Landing page with lead capture form and admin panel for a Kyiv-based law firm. Multilingual (UA/RU), responsive, with automated lead processing pipeline.

![Tech Stack](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-06B6D4?style=flat&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)

## Features

- **Multilingual Landing Page** — Ukrainian/Russian with locale-based routing
- **Lead Capture Form** — validation, spam protection (rate limiting), real-time processing
- **Automated Notifications** — Telegram Bot API, email via Resend, Google Sheets storage
- **Admin Panel** — JWT authentication with IP-binding for secure access
- **Resilience** — Circuit Breaker pattern for handling external API failures
- **Production Ready** — custom domain, SSL, DNS via Cloudflare + Vercel deployment

## Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Responsive design

**Backend:**
- Next.js API Routes
- JWT Authentication (jsonwebtoken)
- Rate limiting (Upstash Redis)
- Input validation & XSS protection

**Integrations:**
- Telegram Bot API (instant notifications)
- Google Sheets API (lead storage)
- Resend (email notifications)
- Upstash Redis (rate limiting)

**Infrastructure:**
- Vercel (hosting & deployment)
- Cloudflare (domain, DNS, SSL)

## Project Structure

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

## Key Implementation Details

### Security
- JWT tokens with 3-hour expiration and IP-binding
- Rate limiting: 5 requests per 15 minutes per IP
- Circuit Breaker for external API resilience
- XSS protection and input validation

### Form Processing Pipeline
1. Client submits form → validation
2. Rate limiting check (Redis)
3. Parallel notifications:
   - Telegram (instant)
   - Google Sheets (CRM)
   - Email (backup)
4. Circuit Breaker handles failures gracefully

### Admin Access
- `/admin` route with JWT-protected API
- Token includes user IP — invalidated if IP changes
- 3-hour session expiration

## Local Development

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

## Deployment

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel Dashboard
3. Configure custom domain in Cloudflare
4. Deploy on push to `main`

## Other Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Next.js agent rules for AI coding assistants |
| `CLAUDE.md` | Reference to AGENTS.md for Claude AI |
| `.env.example` | Example environment variables |
| `README_UA.md` | [Українська версія документації](./README_UA.md) |

## License

Private — commercial project for Ю.Р.С.П. law firm.
