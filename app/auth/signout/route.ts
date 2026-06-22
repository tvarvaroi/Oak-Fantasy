import { NextResponse, type NextRequest } from 'next/server';

import { getServerSupabase } from '@/lib/supabase-server';
import { isLocale } from '@/lib/i18n-routes';

export const dynamic = 'force-dynamic';

// Server-side sign out. POST so it isn't triggerable by a stray GET/prefetch.
// Reads `locale` from the form body to redirect back to the right homepage.
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  await supabase.auth.signOut();

  let locale = 'ro';
  try {
    const form = await request.formData();
    const l = form.get('locale');
    if (typeof l === 'string' && isLocale(l)) locale = l;
  } catch {
    // no body — fall back to ro
  }

  return NextResponse.redirect(new URL(`/${locale}`, request.url), { status: 303 });
}
