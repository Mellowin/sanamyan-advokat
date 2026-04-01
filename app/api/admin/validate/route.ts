import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, verifyIpMatch } from '@/lib/auth/jwt';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json(
      { error: 'No token provided' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Проверяем IP
  const currentIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  if (!verifyIpMatch(payload, currentIp)) {
    logger.warn({ 
      event: 'token_ip_mismatch', 
      tokenIp: payload.ip, 
      currentIp 
    }, 'Token IP mismatch');
    
    return NextResponse.json(
      { error: 'IP address changed. Please login again.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    valid: true,
    userId: payload.userId,
    role: payload.role
  });
}
