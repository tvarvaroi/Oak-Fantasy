'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, ImageOff } from 'lucide-react';

import { Switch } from '@/components/ui/switch';
import { toggleProductStatus } from '@/lib/admin/product-actions';
import { baniToRon, type Status } from '@/lib/schemas/product';
import type { AdminProduct } from '@/lib/admin/products';

const STATUS_LABEL: Record<Status, string> = {
  active: 'Activ',
  draft: 'Draft',
  archived: 'Arhivat',
};

const STATUS_COLOR: Record<Status, { bg: string; fg: string }> = {
  active: { bg: 'rgba(143,160,104,0.22)', fg: 'var(--forest-deep)' },
  draft: { bg: 'rgba(184,115,51,0.16)', fg: 'var(--copper)' },
  archived: { bg: 'rgba(93,78,58,0.14)', fg: 'var(--ink-soft)' },
};

function formatRon(bani: number): string {
  return `${baniToRon(bani).toLocaleString('ro-RO')} RON`;
}

function StatusBadge({ status }: { status: string }) {
  const key = (['active', 'draft', 'archived'].includes(status) ? status : 'draft') as Status;
  const c = STATUS_COLOR[key];
  return (
    <span
      className="label-caps inline-block"
      style={{ backgroundColor: c.bg, color: c.fg, borderRadius: 999, padding: '3px 10px', fontSize: '0.58rem' }}
    >
      {STATUS_LABEL[key]}
    </span>
  );
}

export interface StockCell {
  available: number;
  low: boolean;
  hasRow: boolean;
}

function ProductRow({ product, stock }: { product: AdminProduct; stock?: StockCell }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Optimistic local view of the on/off state; ON means status === 'active'.
  const [active, setActive] = useState(product.status === 'active');
  const [error, setError] = useState<string | null>(null);

  const onToggle = (next: boolean) => {
    setActive(next);
    setError(null);
    startTransition(async () => {
      const res = await toggleProductStatus(product.id, next);
      if (!res.ok) {
        setActive(!next); // revert
        setError(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const cellStyle: React.CSSProperties = {
    padding: '14px 12px',
    borderBottom: '1px solid rgba(92,58,32,0.12)',
    verticalAlign: 'middle',
  };

  return (
    <tr style={{ opacity: isPending ? 0.6 : 1 }}>
      <td style={cellStyle}>
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: 'var(--paper-aged)' }}
        >
          {product.hero_image_url ? (
            <Image src={product.hero_image_url} alt="" fill sizes="48px" style={{ objectFit: 'cover' }} />
          ) : (
            <ImageOff size={18} color="var(--ink-soft)" strokeWidth={1.5} aria-label="Fără imagine" />
          )}
        </div>
      </td>
      <td style={cellStyle}>
        <span className="font-caudex block" style={{ color: 'var(--oak-deep)', fontWeight: 700 }}>
          {product.name_ro}
        </span>
        <span className="font-lora block" style={{ color: 'var(--ink-soft)', fontSize: '0.78rem' }}>
          {product.sku}
        </span>
      </td>
      <td style={cellStyle}>
        <span className="font-lora capitalize" style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
          {product.tier}
        </span>
      </td>
      <td style={cellStyle}>
        <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>
          {formatRon(product.price_ron)}
        </span>
      </td>
      <td style={cellStyle}>
        {!stock || !stock.hasRow ? (
          <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>—</span>
        ) : (
          <span
            className="font-lora"
            style={{
              fontSize: '0.9rem',
              fontWeight: stock.available <= 0 ? 700 : 400,
              color: stock.available <= 0 ? '#9F2D20' : stock.low ? 'var(--copper)' : 'var(--ink)',
            }}
          >
            {stock.available <= 0 ? 'Epuizat' : stock.available}
          </span>
        )}
      </td>
      <td style={cellStyle}>
        <StatusBadge status={product.status} />
      </td>
      <td style={cellStyle}>
        <div className="flex items-center gap-2">
          <Switch checked={active} onCheckedChange={onToggle} disabled={isPending} aria-label="Activează produsul" />
          <span className="font-lora" style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
            {active ? 'Activ' : 'Inactiv'}
          </span>
        </div>
        {error ? (
          <span className="font-lora block" style={{ fontSize: '0.72rem', color: '#9F2D20', marginTop: 4 }}>
            {error}
          </span>
        ) : null}
      </td>
      <td style={{ ...cellStyle, textAlign: 'right' }}>
        <Link
          href={`/admin/produse/${product.id}/edit`}
          className="inline-flex items-center gap-1.5 font-caudex transition-opacity hover:opacity-80"
          style={{ color: 'var(--oak-warm)', fontSize: '0.85rem' }}
        >
          <Pencil size={15} strokeWidth={1.75} aria-hidden />
          Editează
        </Link>
      </td>
    </tr>
  );
}

export default function ProductTable({
  products,
  stock,
}: {
  products: AdminProduct[];
  stock?: Record<string, StockCell>;
}) {
  if (products.length === 0) {
    return (
      <p className="font-lora" style={{ color: 'var(--ink-soft)', padding: '32px 0' }}>
        Niciun produs încă. Apasă „Adaugă produs” ca să creezi primul.
      </p>
    );
  }

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '0 12px 10px',
    borderBottom: '1px solid rgba(92,58,32,0.2)',
  };

  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead>
          <tr>
            <th className="label-caps" style={{ ...thStyle, color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
              Imagine
            </th>
            <th className="label-caps" style={{ ...thStyle, color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
              Produs
            </th>
            <th className="label-caps" style={{ ...thStyle, color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
              Tier
            </th>
            <th className="label-caps" style={{ ...thStyle, color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
              Preț
            </th>
            <th className="label-caps" style={{ ...thStyle, color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
              Stoc
            </th>
            <th className="label-caps" style={{ ...thStyle, color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
              Status
            </th>
            <th className="label-caps" style={{ ...thStyle, color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
              Vizibil pe site
            </th>
            <th style={thStyle} aria-label="Acțiuni" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <ProductRow key={p.id} product={p} stock={stock?.[p.id]} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
