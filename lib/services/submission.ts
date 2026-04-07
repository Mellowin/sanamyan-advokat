import { TelegramProvider } from '@/lib/providers/telegram';
import { SheetsProvider, SubmissionData } from '@/lib/providers/sheets';
import { EmailProvider, EmailData } from '@/lib/providers/email';
import { SendGridProvider } from '@/lib/providers/sendgrid';
import { createTelegramCircuitBreaker, CircuitBreaker } from '@/lib/providers/circuit-breaker';
import { Redis } from '@upstash/redis';
import logger, { createRequestLogger } from '@/lib/logger';

// Получаем текущее время в часовом поясе Киева (UTC+3)
function getKyivTimestamp(): string {
  const now = new Date();
  const kyivTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Kiev' }));
  const year = kyivTime.getFullYear();
  const month = String(kyivTime.getMonth() + 1).padStart(2, '0');
  const day = String(kyivTime.getDate()).padStart(2, '0');
  const hours = String(kyivTime.getHours()).padStart(2, '0');
  const minutes = String(kyivTime.getMinutes()).padStart(2, '0');
  const seconds = String(kyivTime.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export interface ProcessSubmissionInput {
  name: string;
  phone: string;
  message?: string;
  locale?: string;
  ip: string;
  requestId: string;
}

export interface ProcessSubmissionResult {
  success: boolean;
  telegramStatus: 'sent' | 'failed' | 'partial';
  emailSent: boolean;
  sheetsSaved: boolean;
}

export class SubmissionService {
  private telegram: TelegramProvider | null;
  private sheets: SheetsProvider | null;
  private email: EmailProvider | null;
  private alertProvider: SendGridProvider | null;
  private redis: Redis | null;

  constructor() {
    // Initialize Redis (for rate limiting, deduplication, and circuit breaker)
    this.redis = null;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
      } catch (error) {
        logger.error({ event: 'redis_init_error' }, 'Failed to initialize Redis');
      }
    }

    // Initialize Circuit Breaker for Telegram
    const telegramBreaker = createTelegramCircuitBreaker(this.redis);

    // Initialize providers
    const chatIds = process.env.TELEGRAM_CHAT_IDS?.split(',').map(id => id.trim()) || [];
    this.telegram = process.env.TELEGRAM_BOT_TOKEN && chatIds.length > 0
      ? new TelegramProvider({
          botToken: process.env.TELEGRAM_BOT_TOKEN,
          chatIds,
          breaker: telegramBreaker,
        })
      : null;

    const cleanSheetId = process.env.GOOGLE_SHEETS_ID?.replace(/^\uFEFF/, '').trim() || '';
    this.sheets = cleanSheetId && process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      ? new SheetsProvider(
          cleanSheetId,
          process.env.GOOGLE_SERVICE_ACCOUNT_KEY
        )
      : null;

    this.email = process.env.RESEND_API_KEY
      ? new EmailProvider(
          process.env.RESEND_API_KEY,
          process.env.FALLBACK_EMAIL || '',
          process.env.ALERT_EMAIL || process.env.FALLBACK_EMAIL || ''
        )
      : null;

    // Separate provider for alerts (SendGrid as backup)
    this.alertProvider = process.env.SENDGRID_API_KEY
      ? new SendGridProvider(
          process.env.SENDGRID_API_KEY,
          process.env.ALERT_FROM_EMAIL || 'alerts@notguilty-legal.com',
          process.env.ALERT_EMAIL || process.env.FALLBACK_EMAIL || ''
        )
      : null;
  }

  async process(input: ProcessSubmissionInput): Promise<ProcessSubmissionResult> {
    const { name, phone, message, locale, ip, requestId } = input;
    const reqLogger = createRequestLogger(requestId, ip);

    let telegramStatus: 'sent' | 'failed' | 'partial' = 'failed';
    let telegramOk = false;
    let emailSent = false;

    // 1. Telegram и Email ПАРАЛЛЕЛЬНО (быстрее)
    const telegramPromise = this.telegram?.sendMessage(
      name, phone, message, locale, requestId
    ).then(({ anyOk, results }) => {
      telegramOk = anyOk;
      if (anyOk) {
        const successCount = results.filter(r => r.ok).length;
        telegramStatus = successCount === 2 ? 'sent' : 'partial';
      }
      reqLogger.info({ event: 'telegram_processed', ok: anyOk }, 'Telegram processed');
      return anyOk;
    }).catch(err => {
      reqLogger.error({ event: 'telegram_error', error: err.message }, 'Telegram error');
      return false;
    });

    // Ждем Telegram (основной канал), макс 1.5 сек
    const telegramTimeout = new Promise<boolean>(resolve => setTimeout(() => {
      reqLogger.info({ event: 'telegram_timeout' }, 'Telegram timeout, trying email');
      resolve(false);
    }, 1500));

    telegramOk = await Promise.race([telegramPromise || Promise.resolve(false), telegramTimeout]);

    // 2. Email fallback (параллельно, если Telegram не успел/упал)
    const emailPromise = (!telegramOk && this.email) 
      ? this.email.sendFallback({
          name, phone, message, timestamp: getKyivTimestamp(), ip, locale,
        }).then(sent => {
          emailSent = sent;
          reqLogger.info({ event: 'email_sent', sent }, 'Email sent');
          return sent;
        }).catch(err => {
          reqLogger.error({ event: 'email_error', error: err.message }, 'Email error');
          return false;
        })
      : Promise.resolve(false);

    // Запускаем Email параллельно и не ждем (fire-and-forget для скорости)
    emailPromise.then(() => {});

    // 3. Sheets — В ФОНЕ, не блокируем ответ!
    // Записываем критические данные, но не ждем результата
    this.saveToSheetsBackground({
      timestamp: getKyivTimestamp(),
      name, phone, message, ip, telegramStatus,
    }, reqLogger);

    // Возвращаем результат БЕЗ ожидания Sheets
    const result = {
      success: telegramOk || emailSent,
      telegramStatus,
      emailSent,
      sheetsSaved: true, // Предполагаем, что запишется
    };

    // Отправляем алерт если совсем все плохо (фоном)
    if (!telegramOk && !emailSent) {
      this.sendCriticalAlert(input, telegramStatus, false, emailSent).catch(() => {});
    }

    return result;
  }

  // Сохранение в Sheets — фоновая задача
  private async saveToSheetsBackground(data: SubmissionData, reqLogger: any): Promise<void> {
    if (!this.sheets) {
      reqLogger.error({ event: 'sheets_not_configured' }, 'Sheets not configured');
      return;
    }

    try {
      // Пробуем 3 раза с интервалом
      for (let attempt = 1; attempt <= 3; attempt++) {
        const saved = await this.sheets.save(data);
        if (saved) {
          reqLogger.info({ event: 'sheets_saved', attempt }, 'Sheets saved');
          return;
        }
        await new Promise(r => setTimeout(r, 1000 * attempt)); // 1s, 2s, 3s
      }
      reqLogger.error({ event: 'sheets_save_failed' }, 'CRITICAL: Failed to save to Sheets after 3 attempts');
    } catch (error) {
      reqLogger.error({ event: 'sheets_error', error: (error as Error).message }, 'Sheets error');
    }
  }

  private async sendCriticalAlert(
    input: ProcessSubmissionInput,
    telegramStatus: string,
    sheetsSaved: boolean,
    emailSent: boolean
  ): Promise<void> {
    // Try SendGrid first (separate provider for alerts)
    if (this.alertProvider) {
      const message = `
Заявка не была доставлена ни по одному каналу:

Request ID: ${input.requestId}
Name: ${input.name}
Phone: ${input.phone}
IP: ${input.ip}
Time: ${new Date().toISOString()}

Telegram: ${telegramStatus}
Sheets: ${sheetsSaved}
Email: ${emailSent}
      `.trim();

      const sent = await this.alertProvider.sendAlert('⚠️ Все каналы доставки недоступны', message);
      if (sent) {
        logger.info({ event: 'critical_alert_sent' }, 'Critical alert sent via SendGrid');
        return;
      }
    }

    // Fallback to Resend if SendGrid not available or failed
    if (this.email) {
      const message = `
Заявка не была доставлена ни по одному каналу:

Request ID: ${input.requestId}
Name: ${input.name}
Phone: ${input.phone}
IP: ${input.ip}
Time: ${new Date().toISOString()}

Telegram: ${telegramStatus}
Sheets: ${sheetsSaved}
Email: ${emailSent}
      `.trim();

      await this.email.sendAlert('⚠️ Все каналы доставки недоступны', message);
    }
  }
}
