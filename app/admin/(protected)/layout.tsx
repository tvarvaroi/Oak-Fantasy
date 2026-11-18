import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { countOrdersToConfirm } from '@/lib/admin/orders';
import { countNewCustomOrders } from '@/lib/admin/custom-orders';

import AdminShell from '@/components/admin/AdminShell';

// THE admin gate + shell. Wraps every protected /admin page. The gate runs
// here AND at each page top (requireAdminOrNotFound): a layout-only guard does
// not stop a child page's RSC payload from streaming into the 404 HTML (Task
// 2.3 leak). Gating here too means the shell chrome (sidebar nav, "Bun venit
// {name}") is never built for a non-admin — notFound() short-circuits before
// any sensitive JSX. RLS is the second, DB-level layer.
//
// Sub-decision (Task 2.3): even an admin with a fully expired session sees 404
// here (security > UX) — they refresh or go to /admin/login manually.

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminOrNotFound();
  const name = user.profile?.full_name || user.email || 'admin';
  // Sidebar badges: orders waiting for confirmation + new custom-order requests
  // (run after the gate, so they only ever execute for a verified admin; the
  // layout is force-dynamic).
  const [ordersToConfirm, customOrdersNew] = await Promise.all([
    countOrdersToConfirm(),
    countNewCustomOrders(),
  ]);

  return (
    <AdminShell userName={name} ordersToConfirm={ordersToConfirm} customOrdersNew={customOrdersNew}>
      {children}
    </AdminShell>
  );
}
