import Link from 'next/link';
import { Package } from 'lucide-react';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';

// /admin dashboard. The shell (sidebar, topbar, logout) lives in the
// (protected) layout now; this page renders only its own content.
//
// SECURITY: the gate runs HERE at the page top too (not only in the layout). A
// layout-only guard lets this page's RSC payload stream into the 404 HTML
// (Task 2.3 leak). requireAdminOrNotFound() short-circuits before any JSX.

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdminOrNotFound();

  return (
    <div style={{ maxWidth: 900 }}>
      <p className="label-caps" style={{ color: 'var(--copper)' }}>
        Panou
      </p>
      <h1
        className="font-caudex"
        style={{ marginTop: 12, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--oak-deep)', fontWeight: 700, lineHeight: 1.1 }}
      >
        Administrare Oak Fantasy
      </h1>
      <p
        className="font-lora"
        style={{ marginTop: 16, fontSize: '1.02rem', color: 'var(--ink-soft)', lineHeight: 1.7, maxWidth: 560 }}
      >
        De aici gestionezi catalogul. Comenzile, abonații și profilul prind contur
        în etapele următoare.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/admin/produse"
          className="flex items-center gap-3 transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
          style={{
            backgroundColor: 'var(--paper-aged)',
            border: '1px solid rgba(92,58,32,0.18)',
            borderRadius: 10,
            padding: '20px 24px',
            minWidth: 240,
          }}
        >
          <Package size={22} strokeWidth={1.75} color="var(--oak-warm)" aria-hidden />
          <span>
            <span className="font-caudex block" style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: '1.05rem' }}>
              Produse
            </span>
            <span className="font-lora block" style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
              Adaugă, editează, activează
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
