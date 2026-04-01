import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth/jwt';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      logger.error({ event: 'admin_login_error' }, 'ADMIN_PASSWORD not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (password !== adminPassword.trim()) {
      logger.warn({ event: 'admin_login_failed' }, 'Invalid password attempt');
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Получаем IP клиента
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Генерируем JWT токен с привязкой к IP
    const token = generateToken('admin', ip);

    logger.info({ event: 'admin_login_success', ip }, 'Admin logged in successfully');

    return NextResponse.json({
      success: true,
      token,
      expiresIn: '3h'
    });

  } catch (error) {
    logger.error({ event: 'admin_login_error', error: (error as Error).message }, 'Login error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
