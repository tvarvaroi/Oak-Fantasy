import Link from 'next/link';

import AdminCard from '@/components/admin/AdminCard';

// Rendered when the admin gate calls notFound() (non-admin or unauthenticated
// hitting a protected /admin route) and for any unknown /admin URL. Wrapped by
// app/admin/layout.tsx (html/body + fonts). Deliberately generic — does not
// reveal whether a protected route exists.
export default function AdminNotFound() {
  return (
    <AdminCard title="Pagină inexistentă">
      <p className="font-lora text-center" style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', lineHeight: 1.65 }}>
        Pagina căutată nu există sau nu este disponibilă.
      </p>
      <div className="mt-6 text-center">
        <Link
          href="/admin/login"
          className="font-caudex"
          style={{ color: 'var(--oak-warm)', textDecoration: 'underline', fontSize: '0.9rem' }}
        >
          Mergi la autentificare
        </Link>
      </div>
    </AdminCard>
  );
}
