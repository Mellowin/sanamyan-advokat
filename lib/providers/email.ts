import { Resend } from 'resend';
import logger from '@/lib/logger';

export interface EmailData {
  name: string;
  phone: string;
  message?: string;
  timestamp: string;
  ip: string;
  locale?: string;
}

export class EmailProvider {
  private resend: Resend | null;
  private fallbackEmail: string;
  private alertEmail: string;

  constructor(apiKey: string, fallbackEmail: string, alertEmail: string) {
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fallbackEmail = fallbackEmail;
    this.alertEmail = alertEmail;
  }

  async sendFallback(data: EmailData): Promise<boolean> {
    if (!this.resend) {
      logger.error({ event: 'email_not_configured' }, 'RESEND_API_KEY not set');
      return false;
    }

    if (!this.fallbackEmail) {
      logger.error({ event: 'email_not_configured' }, 'FALLBACK_EMAIL not set');
      return false;
    }

    const subject = `🔔 Новая заявка с сайта от ${data.name}`;
    
    const html = `
      <h2>Новая заявка с сайта notguilty-legal.com</h2>
      <hr/>
      <p><strong>Имя:</strong> ${data.name}</p>
      <p><strong>Телефон:</strong> ${data.phone}</p>
      <p><strong>Язык:</strong> ${data.locale === 'ua' ? 'Українська' : 'Русский'}</p>
      <p><strong>Сообщение:</strong></p>
      <p>${data.message || 'Не указано'}</p>
      <hr/>
      <p><strong>IP:</strong> ${data.ip}</p>
      <p><strong>Время:</strong> ${new Date(data.timestamp).toLocaleString('uk-UA')}</p>
      <p><em>Это fallback-письмо (Telegram не доставил).</em></p>
    `;

    const text = `
Новая заявка с сайта notguilty-legal.com

Имя: ${data.name}
Телефон: ${data.phone}
Язык: ${data.locale === 'ua' ? 'Українська' : 'Русский'}
Сообщение: ${data.message || 'Не указано'}

IP: ${data.ip}
Время: ${new Date(data.timestamp).toLocaleString('uk-UA')}

(Это fallback-письмо, Telegram не доставил)
    `.trim();

    try {
      const { data: result, error } = await this.resend.emails.send({
        from: 'Sanamyan Advokat <onboarding@resend.dev>',
        to: [this.fallbackEmail],
        subject,
        html,
        text,
      });

      if (error) {
        logger.error({ event: 'email_send_error', error }, 'Failed to send email');
        return false;
      }

      logger.info({ event: 'email_sent', id: result?.id }, 'Email sent successfully');
      return true;
    } catch (error) {
      logger.error({ event: 'email_exception', error: (error as Error).message }, 'Email send exception');
      return false;
    }
  }

  async sendAlert(subject: string, message: string): Promise<boolean> {
    if (!this.resend) {
      logger.error({ event: 'email_not_configured' }, 'RESEND_API_KEY not set');
      return false;
    }

    const toEmail = this.alertEmail || this.fallbackEmail;
    if (!toEmail) {
      logger.error({ event: 'email_not_configured' }, 'No alert email configured');
      return false;
    }

    try {
      const { data: result, error } = await this.resend.emails.send({
        from: 'Sanamyan Alerts <onboarding@resend.dev>',
        to: [toEmail],
        subject: `⚠️ ${subject}`,
        html: `<pre>${message}</pre>`,
        text: message,
      });

      if (error) {
        logger.error({ event: 'alert_send_error', error }, 'Alert email failed');
        return false;
      }

      logger.info({ event: 'alert_sent', id: result?.id }, 'Alert sent successfully');
      return true;
    } catch (error) {
      logger.error({ event: 'alert_exception', error: (error as Error).message }, 'Alert send exception');
      return false;
    }
  }
}
