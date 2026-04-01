import { NextRequest, NextResponse } from 'next/server';
import { SheetsProvider } from '@/lib/providers/sheets';
import { verifyToken, extractTokenFromHeader, verifyIpMatch } from '@/lib/auth/jwt';
import logger from '@/lib/logger';

// Проверка JWT токена
function isAuthorized(request: NextRequest): { authorized: boolean; reason?: string } {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    logger.warn({ event: 'auth_no_token' }, 'No token provided');
    return { authorized: false, reason: 'no_token' };
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    logger.warn({ event: 'auth_invalid_token' }, 'Invalid token');
    return { authorized: false, reason: 'invalid_token' };
  }
  
  if (payload.role !== 'admin') {
    logger.warn({ event: 'auth_wrong_role', role: payload.role }, 'Wrong role');
    return { authorized: false, reason: 'wrong_role' };
  }
  
  // Проверяем IP
  const currentIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  if (!verifyIpMatch(payload, currentIp)) {
    logger.warn({ 
      event: 'auth_ip_mismatch', 
      tokenIp: payload.ip, 
      currentIp 
    }, 'IP mismatch');
    return { authorized: false, reason: 'ip_mismatch' };
  }
  
  return { authorized: true };
}

export async function GET(request: NextRequest) {
  // Проверяем авторизацию
  const auth = isAuthorized(request);
  if (!auth.authorized) {
    const errorMessage = auth.reason === 'ip_mismatch' 
      ? 'IP address changed. Please login again.' 
      : 'Unauthorized';
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }

  // Проверяем env vars
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!sheetId) {
    logger.error({ event: 'submissions_no_sheet_id' }, 'GOOGLE_SHEETS_ID not set');
    return NextResponse.json(
      { error: 'Server configuration error: no sheet ID' },
      { status: 500 }
    );
  }
  
  if (!credentials) {
    logger.error({ event: 'submissions_no_credentials' }, 'GOOGLE_SERVICE_ACCOUNT_KEY not set');
    return NextResponse.json(
      { error: 'Server configuration error: no credentials' },
      { status: 500 }
    );
  }

  try {
    // Убираем BOM и пробелы из sheetId
    const cleanSheetId = sheetId.replace(/^\uFEFF/, '').trim();
    logger.info({ event: 'submissions_fetch_start', sheetId: cleanSheetId }, 'Fetching submissions from Sheets');
    
    const sheets = new SheetsProvider(cleanSheetId, credentials);
    const submissions = await sheets.getAll();
    
    logger.info({ 
      event: 'submissions_fetch_success', 
      count: submissions.length 
    }, `Fetched ${submissions.length} submissions`);
    
    return NextResponse.json({ submissions });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ 
      event: 'submissions_fetch_error', 
      error: errorMessage 
    }, 'Failed to get submissions');
    
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: errorMessage },
      { status: 500 }
    );
  }
}
