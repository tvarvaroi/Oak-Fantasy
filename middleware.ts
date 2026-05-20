import { NextRequest, NextResponse } from 'next/server';
import {
  PATHNAMES,
  routeKeyForSlug,
  localizedPath,
  canonicalPath,
  type Locale,
} from '@/lib/i18n-routes';

const LOCALES = ['ro', 'en'] as const;

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

  if (localeInPath) {
    // ── Path-localized routes (e.g. /ro/despre <-> /en/about) ──────────────
    // segments: ['', locale, slug, ...rest]
    const segments = pathname.split('/');
    const slug = segments[2];
    const routeKey = slug ? routeKeyForSlug(slug) : null;

    if (routeKey) {
      const expectedSlug = PATHNAMES[routeKey][localeInPath];
      const canonicalSlug = PATHNAMES[routeKey].ro; // == Next.js route folder

      if (slug !== expectedSlug) {
        // Wrong locale's slug (e.g. /en/despre, /ro/about) -> 308 to the
        // correct public URL for this locale (consolidate for SEO).
        const rest = segments.slice(3).join('/');
        const url = request.nextUrl.clone();
        url.pathname = localizedPath(routeKey, localeInPath) + (rest ? `/${rest}` : '');
        return NextResponse.redirect(url, 308);
      }

      if (slug !== canonicalSlug) {
        // Correct localized URL but slug differs from the route folder
        // (e.g. /en/about) -> rewrite onto the canonical folder, URL unchanged.
        const rest = segments.slice(3).join('/');
        const url = request.nextUrl.clone();
        url.pathname =
          canonicalPath(routeKey, localeInPath) + (rest ? `/${rest}` : '');
        return NextResponse.rewrite(url);
      }
      // slug === canonicalSlug === expectedSlug (e.g. /ro/despre): fall through
    }

    // Homepage (/ro, /en) and any non-localized route: unchanged behaviour.
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
