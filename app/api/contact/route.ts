import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/lib/services/submission';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const headersList = await headers();
    
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

    // ОБРАБОТКА: Telegram + Email параллельно (быстро)
    // Sheets — в фоне, не ждем
    const service = new SubmissionService();
    
    // Запускаем обработку
    const resultPromise = service.process(submissionData);
    
    // Ждем максимум 2 секунды основные каналы (Telegram/Email)
    // Если не успевает — все равно показываем успех, обработка идет дальше
    const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 2000));
    
    await Promise.race([resultPromise, timeoutPromise]);

    // МГНОВЕННЫЙ ответ (макс 2 сек вместо 5)
    return NextResponse.json({ 
      success: true, 
      message: 'Дякуємо! Ми отримали заявку.',
      requestId,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      }
    });

  } catch (error) {
    console.error('Contact error:', error);
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
