import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ua', 'ru'],
  defaultLocale: 'ua',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
