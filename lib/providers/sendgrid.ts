import logger from '@/lib/logger';

export class SendGridProvider {
  private apiKey: string;
  private fromEmail: string;
  private toEmail: string;

  constructor(apiKey: string, fromEmail: string, toEmail: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
    this.toEmail = toEmail;
  }

  async sendAlert(subject: string, message: string): Promise<boolean> {
    if (!this.apiKey) {
      logger.error({ event: 'sendgrid_not_configured' }, 'SENDGRID_API_KEY not set');
      return false;
    }

    if (!this.toEmail) {
      logger.error({ event: 'sendgrid_not_configured' }, 'Alert email not configured');
      return false;
    }

    const html = `
      <h2>⚠️ ${subject}</h2>
      <pre style="background:#f5f5f5;padding:10px;border-radius:5px;">${message}</pre>
      <hr/>
      <p><em>Sent via SendGrid Alert System</em></p>
    `;

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: this.toEmail }],
          }],
          from: { email: this.fromEmail },
          subject: subject,
          content: [
            { type: 'text/plain', value: message },
            { type: 'text/html', value: html },
          ],
        }),
      });

      if (response.ok) {
        logger.info({ event: 'sendgrid_alert_sent', to: this.toEmail }, 'SendGrid alert sent');
        return true;
      } else {
        const error = await response.json();
        logger.error({ event: 'sendgrid_alert_error', error }, 'SendGrid alert failed');
        return false;
      }
    } catch (error) {
      logger.error({ event: 'sendgrid_alert_exception', error: (error as Error).message }, 'SendGrid alert exception');
      return false;
    }
  }
}
