import { NextResponse, type NextRequest } from 'next/server';

import { getServerSupabase } from '@/lib/supabase-server';
import { isLocale } from '@/lib/i18n-routes';
import { safeRedirectPath } from '@/lib/safe-redirect';

export const dynamic = 'force-dynamic';

// Server-side sign out. POST so it isn't triggerable by a stray GET/prefetch.
// Redirect target:
//   - `redirectTo` (same-origin path only — lib/safe-redirect.ts) wins; used by
//     the admin area to land on /admin/login after sign out (Task 2.3 D5).
//   - else `locale` form field -> that locale's homepage.
//   - else /ro.
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  await supabase.auth.signOut();

  let target = '/ro';
  try {
    const form = await request.formData();

    // Same-origin paths only — see lib/safe-redirect.ts (`/\evil.com` bypass).
    const safe = safeRedirectPath(form.get('redirectTo'), '', request.url);
    if (safe) {
      target = safe;
    } else {
      const l = form.get('locale');
      if (typeof l === 'string' && isLocale(l)) target = `/${l}`;
    }
  } catch {
    // no body — fall back to /ro
  }

  return NextResponse.redirect(new URL(target, request.url), { status: 303 });
}
