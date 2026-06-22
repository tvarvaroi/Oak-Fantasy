import { redirect } from 'next/navigation';

import AdminCard from '@/components/admin/AdminCard';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { getUser } from '@/lib/auth/get-user';

// PUBLIC admin login (outside the (protected) gate). Redirect-away: an admin
// who is already signed in goes straight to the dashboard. A logged-in
// customer is NOT redirected — they can see the form, but submitting signs
// them out with "access denied" (handled in AdminLoginForm).
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const user = await getUser();
  if (user?.role === 'admin') redirect('/admin');

  return (
    <AdminCard eyebrow="Panou de administrare" title="Autentificare">
      <AdminLoginForm />
    </AdminCard>
  );
}
