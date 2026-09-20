import logger from '@/lib/logger';
import { Redis } from '@upstash/redis';

// Circuit Breaker States
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;      // Сколько ошибок подряд открывают breaker
  successThreshold: number;      // Сколько успехов нужно для закрытия (в HALF_OPEN)
  timeout: number;               // Мс, сколько ждать перед HALF_OPEN
  redis: Redis | null;
}

export class CircuitBreaker {
  private name: string;
  private failureThreshold: number;
  private successThreshold: number;
  private timeout: number;
  private redis: Redis | null;

  constructor(config: CircuitBreakerConfig) {
    this.name = config.name;
    this.failureThreshold = config.failureThreshold;
    this.successThreshold = config.successThreshold;
    this.timeout = config.timeout;
    this.redis = config.redis;
  }

  // Redis keys для хранения состояния
  private get stateKey() { return `cb:${this.name}:state`; }
  private get failuresKey() { return `cb:${this.name}:failures`; }
  private get lastFailureKey() { return `cb:${this.name}:lastFailure`; }
  private get successesKey() { return `cb:${this.name}:successes`; }

  // Все обращения к Redis обёрнуты в try-catch: при недоступности Redis
  // breaker деградирует до безопасных значений и не роняет основной запрос.
  private async safe<T>(op: () => Promise<T>, fallback: T): Promise<T> {
    if (!this.redis) return fallback;
    try {
      return await op();
    } catch (error) {
      logger.warn({
        event: 'circuit_breaker_redis_error',
        name: this.name,
        error: (error as Error).message
      }, 'Circuit breaker Redis operation failed, using fallback');
      return fallback;
    }
  }

  async getState(): Promise<CircuitState> {
    return this.safe(async () => {
      const state = await this.redis!.get(this.stateKey) as CircuitState;
      return state || 'CLOSED';
    }, 'CLOSED');
  }

  async setState(state: CircuitState): Promise<void> {
    await this.safe(async () => {
      await this.redis!.set(this.stateKey, state, { ex: 86400 }); // TTL 24 часа
    }, undefined);
    logger.info({ 
      event: 'circuit_breaker_state_change', 
      name: this.name, 
      state 
    }, `Circuit breaker ${this.name} is now ${state}`);
  }

  async getFailures(): Promise<number> {
    return this.safe(async () => {
      const failures = await this.redis!.get(this.failuresKey);
      return (failures as number) || 0;
    }, 0);
  }

  async incrementFailures(): Promise<number> {
    return this.safe(async () => {
      const failures = await this.redis!.incr(this.failuresKey);
      await this.redis!.expire(this.failuresKey, 86400);
      return failures;
    }, 1);
  }

  async resetFailures(): Promise<void> {
    await this.safe(async () => {
      await this.redis!.del(this.failuresKey);
    }, undefined);
  }

  async getSuccesses(): Promise<number> {
    return this.safe(async () => {
      const successes = await this.redis!.get(this.successesKey);
      return (successes as number) || 0;
    }, 0);
  }

  async incrementSuccesses(): Promise<number> {
    return this.safe(async () => {
      const successes = await this.redis!.incr(this.successesKey);
      await this.redis!.expire(this.successesKey, 86400);
      return successes;
    }, 1);
  }

  async resetSuccesses(): Promise<void> {
    await this.safe(async () => {
      await this.redis!.del(this.successesKey);
    }, undefined);
  }

  async getLastFailureTime(): Promise<number> {
    return this.safe(async () => {
      const time = await this.redis!.get(this.lastFailureKey);
      return (time as number) || 0;
    }, 0);
  }

  async setLastFailureTime(): Promise<void> {
    await this.safe(async () => {
      await this.redis!.set(this.lastFailureKey, Date.now(), { ex: 86400 });
    }, undefined);
  }

  // Проверить, можно ли выполнять запрос
  async canExecute(): Promise<boolean> {
    const state = await this.getState();
    
    if (state === 'CLOSED') {
      return true;
    }
    
    if (state === 'OPEN') {
      const lastFailure = await this.getLastFailureTime();
      const now = Date.now();
      
      // Прошло достаточно времени для HALF_OPEN?
      if (now - lastFailure >= this.timeout) {
        await this.setState('HALF_OPEN');
        await this.resetSuccesses();
        logger.info({ 
          event: 'circuit_breaker_half_open', 
          name: this.name 
        }, `Circuit breaker ${this.name} entering HALF_OPEN state`);
        return true;
      }
      
      return false; // Ещё в таймауте
    }
    
    if (state === 'HALF_OPEN') {
      return true; // Пропускаем один запрос для проверки
    }
    
    return true;
  }

  // Записать успех
  async recordSuccess(): Promise<void> {
    const state = await this.getState();
    
    if (state === 'HALF_OPEN') {
      const successes = await this.incrementSuccesses();
      
      if (successes >= this.successThreshold) {
        await this.setState('CLOSED');
        await this.resetFailures();
        await this.resetSuccesses();
        logger.info({ 
          event: 'circuit_breaker_closed', 
          name: this.name 
        }, `Circuit breaker ${this.name} closed after ${successes} successes`);
      }
    } else if (state === 'CLOSED') {
      // В CLOSED просто сбрасываем счётчик ошибок при успехе
      await this.resetFailures();
    }
  }

  // Записать ошибку
  async recordFailure(): Promise<void> {
    const state = await this.getState();
    await this.setLastFailureTime();
    
    if (state === 'HALF_OPEN') {
      // В HALF_OPEN любая ошибка сразу открывает breaker
      await this.setState('OPEN');
      await this.resetSuccesses();
      logger.warn({ 
        event: 'circuit_breaker_open', 
        name: this.name,
        reason: 'failure_in_half_open'
      }, `Circuit breaker ${this.name} opened due to failure in HALF_OPEN`);
      return;
    }
    
    const failures = await this.incrementFailures();
    
    if (failures >= this.failureThreshold) {
      await this.setState('OPEN');
      logger.warn({ 
        event: 'circuit_breaker_open', 
        name: this.name,
        failures,
        threshold: this.failureThreshold
      }, `Circuit breaker ${this.name} opened after ${failures} failures`);
    }
  }

  // Получить статус для логирования
  async getStatus(): Promise<{ state: CircuitState; failures: number; successes: number }> {
    return {
      state: await this.getState(),
      failures: await this.getFailures(),
      successes: await this.getSuccesses()
    };
  }
}

// Factory для создания breaker'ов
export function createTelegramCircuitBreaker(redis: Redis | null): CircuitBreaker {
  return new CircuitBreaker({
    name: 'telegram',
    failureThreshold: 2,      // 2 ошибки подряд → OPEN (агрессивно)
    successThreshold: 2,      // 2 успеха в HALF_OPEN → CLOSED
    timeout: 60000,           // 1 минута ожидания перед HALF_OPEN
    redis
  });
}
