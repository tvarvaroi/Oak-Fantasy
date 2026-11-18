import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { fetchCustomOrder } from '@/lib/admin/custom-orders';
import { formatOrderDateTime } from '@/lib/admin/orders';
import { customerGreeting } from '@/lib/custom-orders/whatsapp-greeting';
import { formatRoPhone } from '@/lib/whatsapp';
import CustomOrderStatusBadge from '@/components/admin/CustomOrderStatusBadge';
import CustomOrderControls from '@/components/admin/CustomOrderControls';

// /admin/comenzi-custom/[id] — one request from /la-comanda (2026-11-18):
// the full idea, a WhatsApp button prefilled in the customer's language,
// status + internal notes, delete. SECURITY: gate at the page top.

export const dynamic = 'force-dynamic';

const card: React.CSSProperties = {
  backgroundColor: 'var(--paper-aged)',
  border: '1px solid rgba(92,58,32,0.18)',
  borderRadius: 10,
  padding: '20px 22px',
};
const sectionLabel: React.CSSProperties = {
  color: 'var(--ink-soft)',
  fontSize: '0.58rem',
  marginBottom: 10,
};

export default async function CustomOrderDetailPage({ params }: { params: { id: string } }) {
  await requireAdminOrNotFound();

  const request = await fetchCustomOrder(params.id);
  if (!request) notFound();

  const whatsapp = customerGreeting(request.customer_phone, request.customer_name, request.locale);
  const edited = request.updated_at !== request.created_at;

  return (
    <div style={{ maxWidth: 920 }}>
      <Link
        href="/admin/comenzi-custom"
        className="font-lora transition-opacity hover:opacity-70"
        style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}
      >
        ← Toate cererile
      </Link>

      <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 14 }}>
        <h1
          className="font-caudex"
          style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)', color: 'var(--oak-deep)', fontWeight: 700 }}
        >
          {request.customer_name}
        </h1>
        <CustomOrderStatusBadge status={request.status} />
      </div>
      <p className="font-lora" style={{ marginTop: 6, color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
        Primită {formatOrderDateTime(request.created_at)} · Limbă: {request.locale.toUpperCase()}
        {edited ? ` · Actualizată ${formatOrderDateTime(request.updated_at)}` : ''}
      </p>

      {/* The idea, as written — on top, because it is what gets read first. */}
      <div style={{ ...card, marginTop: 22 }}>
        <p className="label-caps" style={sectionLabel}>
          Ideea clientului
        </p>
        <p
          className="font-lora"
          style={{ color: 'var(--ink)', fontSize: '0.98rem', lineHeight: 1.75, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
        >
          {request.description}
        </p>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 16 }}>
        {/* Contact */}
        <div style={card}>
          <p className="label-caps" style={sectionLabel}>
            Telefon
          </p>
          <p className="font-caudex" style={{ fontSize: '1.25rem', color: 'var(--ink)', letterSpacing: '0.02em' }}>
            {formatRoPhone(request.customer_phone)}
          </p>
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="custom-order-whatsapp"
              className="inline-flex items-center gap-2 font-caudex transition-opacity hover:opacity-90"
              style={{
                marginTop: 14,
                minHeight: 44,
                padding: '10px 18px',
                borderRadius: 8,
                backgroundColor: 'var(--forest-mid)',
                color: 'var(--cream-warm)',
                fontSize: '0.9rem',
                letterSpacing: '0.03em',
              }}
            >
              <MessageCircle size={17} strokeWidth={1.75} aria-hidden />
              Scrie pe WhatsApp
            </a>
          ) : null}
          <p className="font-lora" style={{ marginTop: 10, color: 'var(--ink-soft)', fontSize: '0.78rem', lineHeight: 1.5 }}>
            Deschide chatul cu un salut precompletat în {request.locale === 'en' ? 'engleză' : 'română'}.
          </p>
        </div>

        {/* Status + notes */}
        <div style={card}>
          <CustomOrderControls
            id={request.id}
            currentStatus={request.status}
            currentNotes={request.internal_notes ?? ''}
            customerName={request.customer_name}
          />
        </div>
      </div>

    </div>
  );
}
