# Настройка Resend Email (Fallback)

## Зачем это нужно

Если Telegram не работает (бот заблокирован, нет интернета, API упал) — заявка всё равно придёт на email.

## Шаг 1: Регистрация в Resend

1. Перейдите на https://resend.com
2. Зарегистрируйтесь (можно через GitHub)
3. Подтвердите email

## Шаг 2: Получение API ключа

1. В Dashboard нажмите "Add API Key"
2. Назовите ключ: `sanamyan-production`
3. Выберите разрешения: `Sending access`
4. Скопируйте ключ (начинается с `re_`)

## Шаг 3: Добавление в Vercel

```bash
npx vercel env add RESEND_API_KEY production
# Вставьте ключ re_xxxxxxxx

npx vercel env add FALLBACK_EMAIL production
# Введите email для получения заявок (например, ваш@gmail.com)
```

## Шаг 4: Тестирование

1. Перейдите в раздел "Emails" в Resend dashboard
2. Нажмите "Send Email" и отправьте тестовое письмо
3. Убедитесь что письмо дошло

## Лимиты (бесплатный тариф)

- 100 писем в день
- 3000 писем в месяц
- Для сайта-визитки этого достаточно

## Как это работает

```
Заявка приходит
    ↓
Telegram отправляется
    ↓
Если Telegram failed → Отправляется email
    ↓
Сохраняется в Google Sheets (всегда)
```

Email приходит с пометкой "(Telegram не доставил)".

## Troubleshooting

**Письма не приходят:**
- Проверьте папку "Спам"
- Убедитесь что `FALLBACK_EMAIL` правильный
- Проверьте лимиты в Resend dashboard

**API Key не работает:**
- Убедитесь что ключ начинается с `re_`
- Проверьте что выбраны правильные разрешения (Sending)
