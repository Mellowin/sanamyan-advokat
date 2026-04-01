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
    this.telegram = process.env.TELEGRAM_BOT_TOKEN
      ? new TelegramProvider({
          botToken: process.env.TELEGRAM_BOT_TOKEN,
          chatIds: ['793675387', '435451269'],
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
          process.env.ALERT_FROM_EMAIL || 'alerts@sanamyan-advokat.vercel.app',
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

    // 1. Try to send to Telegram
    if (this.telegram) {
      try {
        const { results, anyOk } = await this.telegram.sendMessage(
          name, phone, message, locale, requestId
        );
        telegramOk = anyOk;

        if (anyOk) {
          const successCount = results.filter(r => r.ok).length;
          telegramStatus = successCount === 2 ? 'sent' : 'partial';
        }

        reqLogger.info({
          event: 'telegram_processed',
          results: results.map(r => ({ chatId: r.chatId, ok: r.ok })),
        }, 'Telegram processed');
      } catch (error) {
        reqLogger.error({ event: 'telegram_error', error: (error as Error).message }, 'Telegram error');
      }
    } else {
      reqLogger.error({ event: 'config_error', reason: 'telegram_not_configured' }, 'Telegram not configured');
    }

    // 2. Fallback to email if Telegram failed
    if (!telegramOk && this.email) {
      reqLogger.info({ event: 'email_fallback_triggered' }, 'Attempting email fallback');
      
      emailSent = await this.email.sendFallback({
        name,
        phone,
        message,
        timestamp: getKyivTimestamp(),
        ip,
        locale,
      });

      if (emailSent) {
        reqLogger.info({ event: 'email_fallback_success' }, 'Email fallback sent');
      } else {
        reqLogger.error({ event: 'email_fallback_failed' }, 'Email fallback failed');
      }
    }

    // 3. Always save to Sheets (critical)
    let sheetsSaved = false;
    if (this.sheets) {
      const submissionData: SubmissionData = {
        timestamp: getKyivTimestamp(),
        name,
        phone,
        message,
        ip,
        telegramStatus,
      };

      sheetsSaved = await this.sheets.save(submissionData);

      if (!sheetsSaved) {
        reqLogger.error({ event: 'sheets_save_failed' }, 'CRITICAL: Failed to save to Sheets');
      }
    } else {
      reqLogger.error({ event: 'config_error', reason: 'sheets_not_configured' }, 'Sheets not configured');
    }

    // 4. Send alert if all failed
    if (!sheetsSaved && !telegramOk && !emailSent) {
      await this.sendCriticalAlert(input, telegramStatus, sheetsSaved, emailSent);
    }

    return {
      success: sheetsSaved || telegramOk || emailSent,
      telegramStatus,
      emailSent,
      sheetsSaved,
    };
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
