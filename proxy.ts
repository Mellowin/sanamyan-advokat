import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['ua', 'ru'];
const defaultLocale = 'ua';

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameHasLocale) return NextResponse.next();
  
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
