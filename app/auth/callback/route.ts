import { NextResponse, type NextRequest } from 'next/server';

import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Auth code-exchange callback. Used by:
//   - password reset (link from Supabase email -> here -> reset page)
//   - Google OAuth (Task 2.3)
// Exchanges the `code` for a session (cookies are written by the server
// client) then forwards to `next` (defaults to the RO homepage).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/ro';

  // Only allow same-origin relative redirects (open-redirect guard).
  const safeNext = next.startsWith('/') ? next : '/ro';

  if (code) {
    const supabase = getServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // No code or exchange failed — send to login with an error flag the page
  // can surface if it wants. Keeps the user out of a broken state.
  return NextResponse.redirect(`${origin}/ro/login?error=auth`);
}
