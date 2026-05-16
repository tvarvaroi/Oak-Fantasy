import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['ro', 'en'] as const;
type Locale = typeof LOCALES[number];

function getLocaleFromPathname(pathname: string): Locale | null {
  const segment = pathname.split('/')[1];
  if (LOCALES.includes(segment as Locale)) return segment as Locale;
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  const localeInPath = getLocaleFromPathname(pathname);

  // Already has a valid locale prefix — let it through
  if (localeInPath) {
    return NextResponse.next();
  }

  // Root "/" or any path without locale: redirect to /ro equivalent
  const url = request.nextUrl.clone();
  url.pathname = `/ro${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
