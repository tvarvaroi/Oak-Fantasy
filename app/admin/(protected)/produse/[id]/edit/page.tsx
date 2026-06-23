import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { fetchProductById } from '@/lib/admin/products';
import { fetchInventory, fetchStockMovements, STOCK_MOVEMENT_LABELS } from '@/lib/admin/inventory';
import { formatOrderDateTime } from '@/lib/admin/orders';
import ProductForm from '@/components/admin/ProductForm';
import StockPanel from '@/components/admin/StockPanel';

// /admin/produse/[id]/edit — edit a product. Gate at the page top, then load
// the row (404 if it doesn't exist).

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requireAdminOrNotFound();
  const product = await fetchProductById(params.id);
  if (!product) notFound();

  const inventory = await fetchInventory(product.id);
  const movements = await fetchStockMovements(product.id);

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

      {/* Stock management (Task 4.1) */}
      <section
        style={{
          marginTop: 40,
          padding: '24px 24px 28px',
          backgroundColor: 'var(--paper-aged)',
          border: '1px solid rgba(92,58,32,0.18)',
          borderRadius: 12,
        }}
      >
        <p className="label-caps" style={{ color: 'var(--copper)' }}>
          Inventar
        </p>
        <h2
          className="font-caudex"
          style={{ marginTop: 6, marginBottom: 18, fontSize: '1.3rem', color: 'var(--oak-deep)', fontWeight: 700 }}
        >
          Stoc
        </h2>

        <StockPanel
          productId={product.id}
          slug={product.slug}
          total={inventory?.quantity_total ?? 0}
          reserved={inventory?.quantity_reserved ?? 0}
          available={inventory?.quantity_available ?? 0}
          hasInventory={!!inventory}
        />

        {/* Movement history (server-rendered) */}
        <h3 className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.6rem', marginTop: 28, marginBottom: 12 }}>
          Istoric mișcări
        </h3>
        {movements.length === 0 ? (
          <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
            Nicio mișcare de stoc înregistrată.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr>
                  {['Tip', 'Schimbare', 'Înainte → După', 'Motiv', 'Dată'].map((h) => (
                    <th
                      key={h}
                      className="label-caps"
                      style={{ textAlign: 'left', padding: '0 10px 8px', color: 'var(--ink-soft)', fontSize: '0.55rem', borderBottom: '1px solid rgba(92,58,32,0.2)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td style={mvCell}>
                      <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.85rem' }}>
                        {STOCK_MOVEMENT_LABELS[m.type] ?? m.type}
                      </span>
                    </td>
                    <td style={mvCell}>
                      <span
                        className="font-lora"
                        style={{ fontSize: '0.85rem', color: m.quantity_change >= 0 ? 'var(--forest-deep)' : '#9F2D20' }}
                      >
                        {m.quantity_change >= 0 ? `+${m.quantity_change}` : m.quantity_change}
                      </span>
                    </td>
                    <td style={mvCell}>
                      <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
                        {m.quantity_before} → {m.quantity_after}
                      </span>
                    </td>
                    <td style={mvCell}>
                      <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.82rem' }}>
                        {m.reason ?? '—'}
                      </span>
                    </td>
                    <td style={mvCell}>
                      <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>
                        {formatOrderDateTime(m.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const mvCell: React.CSSProperties = {
  padding: '10px 10px',
  borderBottom: '1px solid rgba(92,58,32,0.1)',
  verticalAlign: 'middle',
};
