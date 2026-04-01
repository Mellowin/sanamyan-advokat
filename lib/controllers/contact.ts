import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService, ProcessSubmissionInput } from '@/lib/services/submission';
import { Redis } from '@upstash/redis';
import logger, { createRequestLogger, logAPIRequest, logAPIResponse } from '@/lib/logger';

// Redis initialization
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  logger.error({ event: 'redis_init_error', error: (error as Error).message }, 'Redis initialization failed');
}

// Constants
const MAX_REQUESTS = 5;
const WINDOW_SECONDS = 3600;

// CORS helpers
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  return origin === 'https://notguilty-legal.com' ||
         origin === 'https://www.notguilty-legal.com' ||
         origin.endsWith('.vercel.app') ||
         origin.startsWith('http://localhost');
}

function getCorsHeaders(origin: string | null, requestId?: string): Record<string, string> {
  const allowedOrigin = isAllowedOrigin(origin) ? (origin || '') : '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Submission-ID',
    'Access-Control-Max-Age': '86400',
  };
  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }
  return headers;
}

// Validation helpers
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\+\-\(\)\s]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 10;
}

function checkXss(input: string): boolean {
  const xssPattern = /<script|javascript:|onerror=|onload=|<iframe|<object|<embed|alert\(|confirm\(|prompt\(/i;
  return xssPattern.test(input);
}

function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Rate limiting
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  if (!redis) {
    return { allowed: true, remaining: 999, resetIn: 0 };
  }

  const key = `rate-limit:${ip}`;
  
  try {
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }
    
    if (count > MAX_REQUESTS) {
      const ttl = await redis.ttl(key);
      return { allowed: false, remaining: 0, resetIn: Math.max(0, ttl) };
    }
    
    return { allowed: true, remaining: MAX_REQUESTS - count, resetIn: 0 };
  } catch (error) {
    logger.warn({ event: 'redis_error', context: 'rate_limit', error: (error as Error).message }, 'Redis error');
    return { allowed: true, remaining: 999, resetIn: 0 };
  }
}

// Duplicate check
async function checkDuplicate(submissionId: string | null): Promise<boolean> {
  if (!submissionId || !redis) return false;
  
  const dupKey = `submission:${submissionId}`;
  const exists = await redis.get(dupKey);
  if (exists) return true;
  
  await redis.set(dupKey, '1', { ex: 60 });
  return false;
}

// Main controller
export async function handleContactRequest(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin, requestId);
  
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json(
      { error: 'CORS: Origin not allowed' },
      { status: 403, headers: corsHeaders }
    );
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';
  
  const reqLogger = createRequestLogger(requestId, ip);
  logAPIRequest(reqLogger, { method: 'POST', path: '/api/contact', ip, userAgent: request.headers.get('user-agent') || 'unknown' });

  try {
    // Check duplicate
    const submissionId = request.headers.get('x-submission-id');
    if (await checkDuplicate(submissionId)) {
      reqLogger.warn({ event: 'duplicate_rejected', submissionId }, 'Duplicate submission rejected');
      return NextResponse.json(
        { success: true, message: 'Already processed' },
        { headers: corsHeaders }
      );
    }

    // Rate limit check
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      reqLogger.warn({ event: 'rate_limit_exceeded', ip, resetIn: rateLimit.resetIn }, 'Rate limit exceeded');
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `Забагато заявок. Спробуйте через ${Math.ceil(rateLimit.resetIn / 60)} хвилин.`,
          retryAfter: rateLimit.resetIn
        },
        { 
          status: 429,
          headers: { ...corsHeaders, 'Retry-After': String(rateLimit.resetIn) }
        }
      );
    }

    // Parse body
    const body = await request.json();
    let { name, phone, message, locale } = body;

    // Validation
    if (checkXss(name) || checkXss(message || '')) {
      reqLogger.warn({ event: 'xss_detected' }, 'XSS detected');
      return NextResponse.json(
        { error: 'XSS detected', message: 'Виявлено заборонені символи' },
        { status: 400, headers: corsHeaders }
      );
    }

    name = sanitizeHtml(name);
    message = message ? sanitizeHtml(message) : '';

    if (!isValidPhone(phone)) {
      reqLogger.warn({ event: 'invalid_phone', phone }, 'Invalid phone');
      return NextResponse.json(
        { error: 'Invalid phone', message: 'Введіть коректний номер телефону' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Process submission
    const service = new SubmissionService();
    const result = await service.process({
      name,
      phone,
      message,
      locale: locale || 'ua',
      ip,
      requestId,
    });

    const duration = Date.now() - startTime;
    logAPIResponse(reqLogger, { status: result.success ? 200 : 500, duration, success: result.success });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        telegramStatus: result.telegramStatus,
        emailFallback: result.emailSent,
        saved: result.sheetsSaved,
        remaining: Math.max(0, rateLimit.remaining - 1)
      }, { headers: corsHeaders });
    } else {
      return NextResponse.json(
        { error: 'Failed to process request', telegramStatus: result.telegramStatus },
        { status: 500, headers: corsHeaders }
      );
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    reqLogger.error({ event: 'fatal_error', duration, error: (error as Error).message }, 'Fatal error');
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
