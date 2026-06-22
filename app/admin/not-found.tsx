import Link from 'next/link';

import AdminCard from '@/components/admin/AdminCard';

// Generic 404 for the admin segment. SECURITY: this must NOT reveal that an
// admin area exists or how to reach it. No "admin", no "login", no link to
// /admin/login — only a neutral "page not found" + a link home, exactly like
// any random non-existent URL on the public site. An attacker probing /admin
// sees the same dead end as /pagina-inexistenta. (Found in Task 2.3 smoke:
// the prior version linked to /admin/login, which defeated hiding /admin.)
export default function AdminNotFound() {
  return (
    <AdminCard title="Pagina nu a fost găsită">
      <p className="font-lora text-center" style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', lineHeight: 1.65 }}>
        Pagina pe care o cauți nu există sau a fost mutată.
      </p>
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="font-caudex"
          style={{ color: 'var(--oak-warm)', textDecoration: 'underline', fontSize: '0.9rem' }}
        >
          Înapoi la pagina principală
        </Link>
      </div>
    </AdminCard>
  );
}
