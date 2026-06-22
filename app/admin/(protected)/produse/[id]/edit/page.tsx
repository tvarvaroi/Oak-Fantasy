import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { fetchProductById } from '@/lib/admin/products';
import ProductForm from '@/components/admin/ProductForm';

// /admin/produse/[id]/edit — edit a product. Gate at the page top, then load
// the row (404 if it doesn't exist).

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requireAdminOrNotFound();
  const product = await fetchProductById(params.id);
  if (!product) notFound();

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
        {product.name_ro}
      </h1>

      <ProductForm product={product} />
    </div>
  );
}
