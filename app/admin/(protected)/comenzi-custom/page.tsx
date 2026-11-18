import Link from 'next/link';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { fetchCustomOrders } from '@/lib/admin/custom-orders';
import { formatOrderDate } from '@/lib/admin/orders';
import {
  CUSTOM_ORDER_STATUSES,
  CUSTOM_ORDER_STATUS_LABELS,
  isCustomOrderStatus,
} from '@/lib/schemas/custom-order';
import { formatRoPhone, waLink } from '@/lib/whatsapp';
import CustomOrderStatusBadge from '@/components/admin/CustomOrderStatusBadge';

// /admin/comenzi-custom — requests from the /la-comanda form (2026-11-18).
// Separate from /admin/comenzi (checkout orders): no stock, no payment.
// Status filter via ?status= (same pattern as Comenzi). Requests arrive only
// from the public form — there is deliberately no "add new" page.
// SECURITY: gate at the page top (RSC-leak lesson).

export const dynamic = 'force-dynamic';

const COLUMNS = ['Primită', 'Client', 'Telefon', 'Ideea', 'Status', ''];

function excerpt(text: string, max = 90): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

export default async function CustomOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAdminOrNotFound();

  const activeFilter =
    searchParams.status && isCustomOrderStatus(searchParams.status) ? searchParams.status : undefined;
  const requests = await fetchCustomOrders(activeFilter);

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '0 12px 10px',
    borderBottom: '1px solid rgba(92,58,32,0.2)',
  };
  const tdStyle: React.CSSProperties = {
    padding: '13px 12px',
    borderBottom: '1px solid rgba(92,58,32,0.12)',
    verticalAlign: 'middle',
  };
  const pillBase: React.CSSProperties = {
    padding: '5px 12px',
    borderRadius: 999,
    fontSize: '0.62rem',
    border: '1px solid rgba(92,58,32,0.25)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <p className="label-caps" style={{ color: 'var(--copper)' }}>
        La comandă
      </p>
      <h1
        className="font-caudex"
        style={{ marginTop: 8, fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: 'var(--oak-deep)', fontWeight: 700 }}
      >
        Comenzi custom
      </h1>
      <p className="font-lora" style={{ marginTop: 6, color: 'var(--ink-soft)', fontSize: '0.9rem', marginBottom: 18 }}>
        {requests.length} {requests.length === 1 ? 'cerere' : 'cereri'}
        {activeFilter ? ` · ${CUSTOM_ORDER_STATUS_LABELS[activeFilter]}` : ''} · trimise din formularul de pe site
      </p>

      <div className="flex flex-wrap gap-2" style={{ marginBottom: 24 }}>
        <Link
          href="/admin/comenzi-custom"
          className="label-caps transition-opacity hover:opacity-80"
          style={{
            ...pillBase,
            backgroundColor: !activeFilter ? 'var(--oak-warm)' : 'transparent',
            color: !activeFilter ? 'var(--cream-warm)' : 'var(--ink-soft)',
          }}
        >
          Toate
        </Link>
        {CUSTOM_ORDER_STATUSES.map((s) => {
          const on = activeFilter === s;
          return (
            <Link
              key={s}
              href={`/admin/comenzi-custom?status=${s}`}
              className="label-caps transition-opacity hover:opacity-80"
              style={{
                ...pillBase,
                backgroundColor: on ? 'var(--oak-warm)' : 'transparent',
                color: on ? 'var(--cream-warm)' : 'var(--ink-soft)',
              }}
            >
              {CUSTOM_ORDER_STATUS_LABELS[s]}
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr>
              {COLUMNS.map((c, i) => (
                <th key={i} className="label-caps" style={{ ...thStyle, color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{ ...tdStyle, textAlign: 'center', padding: '48px 12px' }}>
                  <span className="font-lora" style={{ color: 'var(--ink-soft)' }}>
                    {activeFilter
                      ? 'Nicio cerere cu acest status.'
                      : 'Cererile trimise din pagina „La comandă” apar aici.'}
                  </span>
                </td>
              </tr>
            ) : (
              requests.map((r) => {
                const wa = waLink(r.customer_phone);
                return (
                  <tr key={r.id}>
                    <td style={tdStyle}>
                      <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {formatOrderDate(r.created_at) || '—'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <Link
                        href={`/admin/comenzi-custom/${r.id}`}
                        className="font-caudex transition-opacity hover:opacity-70"
                        style={{ color: 'var(--oak-deep)', fontWeight: 700 }}
                      >
                        {r.customer_name}
                      </Link>
                      {r.locale === 'en' ? (
                        <span className="label-caps" style={{ marginLeft: 8, fontSize: '0.55rem', color: 'var(--ink-soft)' }}>
                          EN
                        </span>
                      ) : null}
                    </td>
                    <td style={tdStyle}>
                      {wa ? (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-lora transition-opacity hover:opacity-70"
                          style={{ color: 'var(--forest-mid)', fontSize: '0.88rem', whiteSpace: 'nowrap', textDecoration: 'underline', textUnderlineOffset: 2 }}
                          title="Deschide chatul pe WhatsApp"
                        >
                          {formatRoPhone(r.customer_phone)}
                        </a>
                      ) : (
                        <span className="font-lora" style={{ fontSize: '0.88rem' }}>{r.customer_phone}</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 360 }}>
                      <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.86rem', lineHeight: 1.5 }}>
                        {excerpt(r.description)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <CustomOrderStatusBadge status={r.status} />
                    </td>
                    <td style={tdStyle}>
                      <Link
                        href={`/admin/comenzi-custom/${r.id}`}
                        className="font-lora transition-opacity hover:opacity-70"
                        style={{ color: 'var(--copper)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                      >
                        Deschide →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
