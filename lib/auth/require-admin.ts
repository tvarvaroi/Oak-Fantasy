// SERVER ONLY. Route-guard helpers for the admin area (Etapa 2.3+).
//
// Layer 1 of the 4-layer admin security model (middleware + RLS + 2FA +
// dedicated /admin/login). RLS still enforces authorization at the DB even if
// a guard is ever bypassed — these helpers are the UX/redirect layer.

import { redirect } from 'next/navigation';

import { getUser, type AuthUser } from './get-user';

// Server Component / layout guard. Redirects unauthenticated or non-admin
// users to /admin/login (built in Etapa 2.3). Returns the admin AuthUser so
// callers can use the profile without re-fetching.
export async function requireAdmin(loginPath = '/admin/login'): Promise<AuthUser> {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    redirect(loginPath);
  }
  return user;
}

// Guard for an authenticated (any role) area, e.g. customer account pages.
export async function requireUser(loginPath = '/login'): Promise<AuthUser> {
  const user = await getUser();
  if (!user) {
    redirect(loginPath);
  }
  return user;
}
