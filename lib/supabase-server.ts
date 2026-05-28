// SERVER ONLY. Imports next/headers cookies(), which throws at build time if
// pulled into a Client Component. Use this file from Server Components,
// 'use server' actions, and route handlers (app/**/route.ts).
//
// Two clients:
//   getServerSupabase()  — cookie-bound anon client for authenticated SSR/SC
//                          reads (foundation for Etapa 2.2 user-context reads).
//   getServiceSupabase() — service-role client. Bypasses RLS. Server only.
//                          Use for guest order creation, stock writes, admin
//                          mutations. NEVER expose SUPABASE_SERVICE_ROLE_KEY
//                          via NEXT_PUBLIC_ or import this into client code.

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export function getServerSupabase() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // cookieStore.set() throws in Server Components — only Server
            // Actions / Route Handlers can write cookies. Safe to swallow:
            // when auth middleware lands (Etapa 2.2) it refreshes the session.
          }
        },
      },
    },
  );
}

export function getServiceSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
