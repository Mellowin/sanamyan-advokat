import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'fallback-secret';
const JWT_EXPIRES_IN = '3h'; // Токен живёт 3 часа

export interface JWTPayload {
  userId: string;
  role: 'admin';
  ip: string; // Привязка к IP
  iat?: number;
  exp?: number;
}

export function generateToken(userId: string = 'admin', ip: string = 'unknown'): string {
  return jwt.sign(
    { userId, role: 'admin', ip },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '').trim();
}

// Проверяем, совпадает ли IP в токене с текущим
export function verifyIpMatch(payload: JWTPayload, currentIp: string): boolean {
  // Если IP не указан в токене (старые токены) — разрешаем
  if (!payload.ip || payload.ip === 'unknown') {
    return true;
  }
  return payload.ip === currentIp;
}
