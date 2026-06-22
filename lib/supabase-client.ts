'use client';

// Browser auth client. Session lives in cookies (via @supabase/ssr) so it is
// readable by the server client (lib/supabase-server.ts) and refreshed by the
// middleware. Use this from Client Components for auth flows (login, signup,
// password reset — Etapa 2.2) and any authenticated client-side reads.
//
// NOT the same as lib/supabase.ts: that file is the public, session-less anon
// client used by the waitlist/EmailForm (evolving into the newsletter
// pre-launch). The two intentionally coexist — public-anon writes vs
// cookie-bound auth — see _brain/notes/journal.txt (Task 2.1).

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
