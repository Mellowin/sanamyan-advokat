import { NextRequest, NextResponse } from 'next/server';
import { enqueueSubmission, processInBackground } from '@/lib/queue';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const headersList = headers();
    
    // Получаем IP
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Генерируем ID запроса
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Подготавливаем данные
    const submissionData = {
      name: data.name || '',
      phone: data.phone || '',
      message: data.message || '',
      locale: data.locale || 'ua',
      ip,
      requestId,
    };

    // 1. Кладем в очередь (20-50ms)
    const queueId = await enqueueSubmission(submissionData);

    // 2. Запускаем обработку в фоне (не ждем!)
    // Это позволяет вернуть ответ сразу, а обработка пойдет параллельно
    processInBackground();

    // 3. МГНОВЕННЫЙ ответ пользователю (50-100ms вместо 3000ms)
    return NextResponse.json({ 
      success: true, 
      message: 'Дякуємо! Ми отримали заявку.',
      requestId, // Для отладки
      queueId,   // Для отладки
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      }
    });

  } catch (error) {
    console.error('Queue error:', error);
    return NextResponse.json(
      { success: false, message: 'Помилка сервера. Спробуйте пізніше.' }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowed = origin === 'https://notguilty-legal.com' ||
                    origin === 'https://www.notguilty-legal.com' ||
                    origin?.endsWith('.vercel.app') ||
                    origin?.startsWith('http://localhost');
  const allowedOrigin = isAllowed ? (origin || '') : '';
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Submission-ID',
      'Access-Control-Max-Age': '86400',
    },
  });
}
