import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import ProductForm from '@/components/admin/ProductForm';

// /admin/produse/nou — create a product. Gate at the page top before any JSX.

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  await requireAdminOrNotFound();

  return (
    <div style={{ maxWidth: 820 }}>
      <Link
        href="/admin/produse"
        className="inline-flex items-center gap-1.5 font-caudex transition-opacity hover:opacity-80 mb-6"
        style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
        Înapoi la produse
      </Link>

      <p className="label-caps" style={{ color: 'var(--copper)' }}>
        Catalog
      </p>
      <h1
        className="font-caudex mb-8"
        style={{ marginTop: 8, fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: 'var(--oak-deep)', fontWeight: 700 }}
      >
        Adaugă produs
      </h1>

      <ProductForm />
    </div>
  );
}
