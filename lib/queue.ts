import { Redis } from '@upstash/redis';
import { SubmissionService, ProcessSubmissionInput } from './services/submission';
import logger from './logger';

// Клиент Redis (используем существующий из переменных окружения)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const QUEUE_KEY = 'submissions:pending';
const PROCESSING_KEY = 'submissions:processing';
const FAILED_KEY = 'submissions:failed';

export interface QueueItem {
  id: string;
  data: ProcessSubmissionInput;
  attempts: number;
  createdAt: string;
}

/**
 * Добавляет заявку в очередь (ящик)
 * Возвращает ID заявки сразу, не ждет обработки
 */
export async function enqueueSubmission(data: ProcessSubmissionInput): Promise<string> {
  const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const item: QueueItem = {
    id,
    data,
    attempts: 0,
    createdAt: new Date().toISOString(),
  };

  // Кладем в очередь (в конец списка)
  await redis.lpush(QUEUE_KEY, JSON.stringify(item));
  
  logger.info({ 
    event: 'submission_queued', 
    requestId: data.requestId,
    queueId: id 
  }, 'Submission added to queue');

  return id;
}

/**
 * Обрабатывает одну заявку из очереди
 * Вызывается в фоне после ответа пользователю
 */
export async function processQueueItem(): Promise<boolean> {
  try {
    // Берем одну заявку из очереди (с конца списка - FIFO)
    const item = await redis.rpop<QueueItem>(QUEUE_KEY);
    
    if (!item) {
      return false; // Очередь пуста
    }

    // Перемещаем в "processing" на время обработки (с TTL 5 минут)
    await redis.set(`${PROCESSING_KEY}:${item.id}`, JSON.stringify(item), { ex: 300 });

    logger.info({ 
      event: 'queue_processing_start', 
      queueId: item.id,
      requestId: item.data.requestId,
      attempt: item.attempts + 1
    }, 'Processing queue item');

    // Обрабатываем через существующий сервис
    const service = new SubmissionService();
    const result = await service.process(item.data);

    if (result.success) {
      // Успех - удаляем из processing
      await redis.del(`${PROCESSING_KEY}:${item.id}`);
      
      logger.info({ 
        event: 'queue_processing_success', 
        queueId: item.id,
        requestId: item.data.requestId,
        result
      }, 'Queue item processed successfully');
      
      return true;
    } else {
      throw new Error('Processing failed - no success flag');
    }

  } catch (error) {
    logger.error({ 
      event: 'queue_processing_error', 
      error: (error as Error).message 
    }, 'Failed to process queue item');
    
    // Если ошибка - элемент останется в failed (для ручной обработки)
    // В следующей версии добавим retry логику
    return false;
  }
}

/**
 * Обрабатывает очередь в фоне (fire-and-forget)
 * Не блокирует ответ пользователю
 */
export function processInBackground(): void {
  // Запускаем обработку без await (fire and forget)
  processQueueItem().catch(error => {
    logger.error({ 
      event: 'background_processing_error', 
      error: (error as Error).message 
    }, 'Background processing failed');
  });
}

/**
 * Получает статистику очереди (для админки)
 */
export async function getQueueStats(): Promise<{
  pending: number;
  processing: number;
  failed: number;
}> {
  const pending = await redis.llen(QUEUE_KEY);
  // Для processing и failed нужно сканировать ключи (упрощенно)
  return {
    pending: pending || 0,
    processing: 0, // TODO: реализовать сканирование
    failed: 0,
  };
}
