import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Simple health check endpoint
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    services: {
      redis: false,
      telegram: true, // Will be checked on actual use
      sheets: true,   // Will be checked on actual use
    }
  };

  // Check Redis
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
    await redis.ping();
    checks.services.redis = true;
  } catch {
    checks.services.redis = false;
  }

  const allOk = Object.values(checks.services).every(v => v);
  
  return NextResponse.json(
    checks,
    { status: allOk ? 200 : 503 }
  );
}
