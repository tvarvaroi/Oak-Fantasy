// SERVER ONLY. Current-user helper for Server Components, 'use server'
// actions, and route handlers. Combines the auth user with their profile row
// (role lives on profiles, gated by RLS — a user can only read their own).

import { getServerSupabase } from '@/lib/supabase-server';
import type { Database } from '@/types/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Role = Profile['role'];

export interface AuthUser {
  id: string;
  email: string | undefined;
  profile: Profile | null;
  role: Role | null;
}

// Returns the authenticated user + their profile/role, or null if no session.
// Uses getUser() (validates the token with the auth server) rather than
// getSession() (trusts the cookie) — safer for authorization decisions.
export async function getUser(): Promise<AuthUser | null> {
  const supabase = getServerSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    profile: profile ?? null,
    role: profile?.role ?? null,
  };
}

export async function isAdmin(): Promise<boolean> {
  const user = await getUser();
  return user?.role === 'admin';
}
