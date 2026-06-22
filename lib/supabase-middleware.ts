// Supabase session refresh for Next.js middleware.
//
// The auth token lives in cookies. On every request the middleware must call
// getUser() so an expiring access token is refreshed and the new cookies are
// written onto the outgoing response — otherwise SSR reads silently lose the
// session. See @supabase/ssr Next.js middleware docs.
//
// We DON'T return a response here. This project's middleware also does i18n
// routing (redirects/rewrites), and a redirect built later would drop any
// Set-Cookie attached to a different response object. Instead we collect the
// cookies the refresh wants to set and let middleware.ts apply them to
// whatever response it ultimately returns (next / redirect / rewrite).

import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export interface RefreshedCookie {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

export async function refreshSession(
  request: NextRequest,
): Promise<RefreshedCookie[]> {
  const cookiesToSet: RefreshedCookie[] = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            // Mirror onto the request so any later read in this pass sees the
            // refreshed value, and stash for the outgoing response.
            request.cookies.set(name, value);
            cookiesToSet.push({ name, value, options: options ?? {} });
          });
        },
      },
    },
  );

  // getUser() (NOT getSession) validates the token against the auth server and
  // triggers the refresh + setAll. Errors are non-fatal here: an anonymous
  // visitor simply has no session to refresh.
  try {
    await supabase.auth.getUser();
  } catch {
    // swallow — anonymous browsing must never break on a refresh hiccup
  }

  return cookiesToSet;
}

// Apply refreshed auth cookies onto whatever response the middleware returns
// (next / redirect / rewrite) so Set-Cookie survives across redirects.
export function applyCookies<T extends NextResponse>(
  response: T,
  cookiesToSet: RefreshedCookie[],
): T {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}
