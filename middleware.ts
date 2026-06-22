import { NextRequest, NextResponse } from 'next/server';
import {
  PATHNAMES,
  routeKeyForSlug,
  localizedPath,
  canonicalPath,
  type Locale,
} from '@/lib/i18n-routes';
import { refreshSession, applyCookies } from '@/lib/supabase-middleware';

const LOCALES = ['ro', 'en'] as const;

function getLocaleFromPathname(pathname: string): Locale | null {
  const segment = pathname.split('/')[1];
  if (LOCALES.includes(segment as Locale)) return segment as Locale;
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Skip /auth/* route handlers (Task 2.2.1 hotfix) ────────────────────
  // /auth/callback + /auth/signout live OUTSIDE [locale] and manage their own
  // Supabase client. They MUST bypass the locale catch-all below — otherwise a
  // no-locale path like /auth/signout gets 307-redirected to /ro/auth/signout
  // (a non-existent route), the handler never runs, and the user lands on a
  // broken page (white screen + React #418/#423 hydration crash). The matcher
  // also excludes /auth, so this is belt-and-suspenders.
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // ── Supabase auth session refresh (Task 2.1) ───────────────────────────
  // Runs FIRST so an expiring token is refreshed on every matched request.
  // refreshSession returns the cookies that must be written; we apply them to
  // EVERY response below (next / redirect / rewrite) so Set-Cookie survives
  // across i18n redirects (the "redirect drops Set-Cookie" gotcha). Anonymous
  // visitors just get an empty cookie list — browsing is unaffected.
  const authCookies = await refreshSession(request);

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
        return applyCookies(NextResponse.redirect(url, 308), authCookies);
      }

      if (slug !== canonicalSlug) {
        // Correct localized URL but slug differs from the route folder
        // (e.g. /en/about) -> rewrite onto the canonical folder, URL unchanged.
        const rest = segments.slice(3).join('/');
        const url = request.nextUrl.clone();
        url.pathname =
          canonicalPath(routeKey, localeInPath) + (rest ? `/${rest}` : '');
        return applyCookies(NextResponse.rewrite(url), authCookies);
      }
      // slug === canonicalSlug === expectedSlug (e.g. /ro/despre): fall through
    }

    // Homepage (/ro, /en) and any non-localized route: unchanged behaviour.
    return applyCookies(NextResponse.next(), authCookies);
  }

  // Root "/" or any path without locale: redirect to /ro equivalent
  const url = request.nextUrl.clone();
  url.pathname = `/ro${pathname === '/' ? '' : pathname}`;
  return applyCookies(NextResponse.redirect(url), authCookies);
}

export const config = {
  // Exclude _next, api, auth (route handlers outside [locale]), and static
  // files. `auth` added in Task 2.2.1 — see the in-function guard above.
  matcher: ['/((?!_next|api|auth|.*\\..*).*)'],
};
