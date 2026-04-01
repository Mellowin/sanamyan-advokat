import logger from '@/lib/logger';
import { CircuitBreaker } from './circuit-breaker';

export interface TelegramResult {
  chatId: string;
  ok: boolean;
  error: string | null;
}

export interface TelegramConfig {
  botToken: string;
  chatIds: string[];
  breaker?: CircuitBreaker;
}

export class TelegramProvider {
  private botToken: string;
  private chatIds: string[];
  private breaker?: CircuitBreaker;

  constructor(config: TelegramConfig) {
    this.botToken = config.botToken;
    this.chatIds = config.chatIds;
    this.breaker = config.breaker;
  }

  async sendMessage(
    name: string,
    phone: string,
    message?: string,
    locale?: string,
    requestId?: string
  ): Promise<{ results: TelegramResult[]; anyOk: boolean }> {
    // Проверяем Circuit Breaker
    if (this.breaker) {
      const canExecute = await this.breaker.canExecute();
      if (!canExecute) {
        const status = await this.breaker.getStatus();
        logger.warn({
          event: 'circuit_breaker_open',
          requestId,
          state: status.state,
          failures: status.failures
        }, 'Circuit breaker is OPEN, skipping Telegram request');
        
        return {
          results: this.chatIds.map(id => ({
            chatId: id,
            ok: false,
            error: `Circuit breaker is ${status.state}`
          })),
          anyOk: false
        };
      }
    }

    const text = this.formatMessage(name, phone, message, locale);
    const results = await Promise.all(
      this.chatIds.map(chatId => this.sendWithRetry(chatId, text, requestId || 'unknown'))
    );
    
    const anyOk = results.some(r => r.ok);
    
    // Обновляем Circuit Breaker
    if (this.breaker) {
      if (anyOk) {
        await this.breaker.recordSuccess();
      } else {
        await this.breaker.recordFailure();
      }
    }
    
    return { results, anyOk };
  }

  private formatMessage(name: string, phone: string, message?: string, locale?: string): string {
    // Форматируем время в украинском часовом поясе (UTC+3)
    const now = new Date();
    const kyivTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Kiev' }));
    const timeString = kyivTime.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return `
🔔 <b>Нова заявка з сайту!</b>

👤 <b>Ім'я:</b> ${name}
📞 <b>Телефон:</b> ${phone}
🌐 <b>Мова:</b> ${locale === 'ua' ? 'Українська' : 'Русский'}

💬 <b>Повідомлення:</b>
${message || 'Не вказано'}

⏰ <b>Час:</b> ${timeString}
    `.trim();
  }

  private async sendWithRetry(
    chatId: string,
    text: string,
    requestId: string,
    attempt: number = 1
  ): Promise<TelegramResult> {
    const telegramUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout (агрессивный)

    try {
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.ok || (data.error_code && data.error_code >= 400 && data.error_code < 500)) {
        return {
          chatId,
          ok: data.ok,
          error: data.ok ? null : data.description,
        };
      }

      // Только 1 retry (всего 2 попытки максимум)
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s задержка перед retry
        return this.sendWithRetry(chatId, text, requestId, attempt + 1);
      }

      return { chatId, ok: false, error: data.description || 'Max retries reached' };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError' || error.message?.includes('fetch')) {
        // Только 1 retry на timeout/network error
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return this.sendWithRetry(chatId, text, requestId, attempt + 1);
        }
        return {
          chatId,
          ok: false,
          error: error.name === 'AbortError' ? 'Timeout after 2s' : 'Network error',
        };
      }

      return { chatId, ok: false, error: error.message || 'Unknown error' };
    }
  }

  // Получить текущий статус breaker'а (для логирования/мониторинга)
  async getBreakerStatus(): Promise<{ state: string; failures: number; successes: number } | null> {
    if (!this.breaker) return null;
    return this.breaker.getStatus();
  }
}
