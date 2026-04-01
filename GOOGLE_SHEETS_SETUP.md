# Настройка Google Sheets для сохранения заявок

## Шаг 1: Создание Google Sheet

1. Перейдите на https://sheets.google.com
2. Создайте новую таблицу
3. Добавьте заголовки в первую строку:
   ```
   A1: Timestamp | B1: Name | C1: Phone | D1: Message | E1: IP | F1: Telegram Status | G1: Telegram Error
   ```
4. Скопируйте ID таблицы из URL (часть между `/d/` и `/edit`)
   - Например: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## Шаг 2: Создание сервисного аккаунта

1. Перейдите на https://console.cloud.google.com
2. Создайте новый проект (или используйте существующий)
3. Включите Google Sheets API:
   - APIs & Services → Library
   - Найдите "Google Sheets API"
   - Нажмите "Enable"

4. Создайте сервисный аккаунт:
   - IAM & Admin → Service Accounts
   - "Create Service Account"
   - Назовите: `sanamyan-sheets`
   - Роль: "Editor" (или "Viewer" если только чтение)
   - Создайте ключ (JSON) и скачайте файл

## Шаг 3: Доступ к таблице

1. Откройте скачанный JSON-файл
2. Скопируйте значение поля `client_email` (вида: `xxx@yyy.iam.gserviceaccount.com`)
3. В Google Sheet нажмите "Share"
4. Добавьте email сервисного аккаунта с правами "Editor"

## Шаг 4: Настройка окружения

Добавьте в Vercel (или `.env.local` для разработки):

```bash
# ID таблицы (из URL)
GOOGLE_SHEETS_ID=your_spreadsheet_id_here

# JSON содержимое всего файла ключа (одной строкой или с \n)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

Для Vercel CLI:
```bash
npx vercel env add GOOGLE_SHEETS_ID
npx vercel env add GOOGLE_SERVICE_ACCOUNT_KEY
```

**Важно:** `GOOGLE_SERVICE_ACCOUNT_KEY` должен быть полным JSON-ом файла ключа.

## Проверка

После деплоя отправьте тестовую заявку. В таблице должна появиться новая строка.

## Troubleshooting

**Ошибка "Permission denied"** — проверьте, что добавили сервисный аккаунт в "Share" таблицы.

**Ошибка "Invalid credentials"** — проверьте, что JSON полностью скопирован (включая все кавычки и скобки).

**Данные не сохраняются** — смотрите логи Vercel (`npx vercel logs`).
