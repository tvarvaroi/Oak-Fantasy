import Link from 'next/link';
import { Plus } from 'lucide-react';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { fetchAllProducts } from '@/lib/admin/products';
import ProductTable from '@/components/admin/ProductTable';

// /admin/produse — catalog list. Shows ALL statuses (the public /tocatoare only
// shows 'active'). SECURITY: gate at the page top before any data fetch/JSX.

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  await requireAdminOrNotFound();
  const products = await fetchAllProducts();

  const activeCount = products.filter((p) => p.status === 'active').length;

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="label-caps" style={{ color: 'var(--copper)' }}>
            Catalog
          </p>
          <h1
            className="font-caudex"
            style={{ marginTop: 8, fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: 'var(--oak-deep)', fontWeight: 700 }}
          >
            Produse
          </h1>
          <p className="font-lora" style={{ marginTop: 6, color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
            {products.length} {products.length === 1 ? 'produs' : 'produse'} · {activeCount} active pe site
          </p>
        </div>

        <Link
          href="/admin/produse/nou"
          className="inline-flex items-center gap-2 font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            backgroundColor: 'var(--oak-warm)',
            color: 'var(--cream-warm)',
            borderRadius: 6,
            letterSpacing: '0.03em',
            padding: '11px 22px',
            fontSize: '0.9rem',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 4px rgba(31,24,16,0.18)',
          }}
        >
          <Plus size={17} strokeWidth={2} aria-hidden />
          Adaugă produs
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  );
}
