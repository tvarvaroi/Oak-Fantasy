// SERVER ONLY. Route-guard helpers for the admin area (Etapa 2.3+).
//
// Layer 1 of the 4-layer admin security model (middleware + RLS + 2FA +
// dedicated /admin/login). RLS still enforces authorization at the DB even if
// a guard is ever bypassed — these helpers are the UX/redirect layer.

import { notFound, redirect } from 'next/navigation';

import { getUser, type AuthUser } from './get-user';

// Page-level admin gate that 404s non-admins. MUST be called at the TOP of
// every protected admin PAGE (not just the layout). A layout-only guard does
// NOT stop the child page from rendering its RSC payload in parallel — that
// payload then leaks into the 404 HTML (found in Task 2.3 security review:
// the dashboard's "Administrare" + "/admin/login" strings appeared in the
// /admin 404 response even though the visible page was the 404). Calling this
// at the page top short-circuits before any sensitive JSX is built.
export async function requireAdminOrNotFound(): Promise<AuthUser> {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    notFound();
  }
  return user;
}

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
