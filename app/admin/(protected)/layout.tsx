import { notFound } from 'next/navigation';

import { getUser } from '@/lib/auth/get-user';

// THE admin gate. Wraps every protected /admin page (dashboard now; CRUD,
// subscribers, etc. in Task 2.4+). Non-admins — unauthenticated OR logged-in
// customers — get a 404 (notFound -> app/admin/not-found.tsx), so the routes
// are fully hidden (no redirect that would confirm they exist). RLS is the
// second, DB-level layer; this is the UX/routing layer.
//
// Sub-decision (Task 2.3): even an admin with a fully expired session sees
// 404 here (security > UX) — they refresh or go to /admin/login manually.

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    notFound();
  }
  return <>{children}</>;
}
