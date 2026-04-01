import { NextRequest, NextResponse } from 'next/server';
import { handleContactRequest } from '@/lib/controllers/contact';

export async function POST(request: NextRequest) {
  return handleContactRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigin = origin === 'https://sanamyan-advokat.vercel.app' ||
                        origin?.endsWith('.vercel.app') ||
                        origin?.startsWith('http://localhost')
                        ? origin || ''
                        : '';
  
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
