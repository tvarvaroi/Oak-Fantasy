'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { formatPriceRon } from '@/components/tocatoare/content';
import { useCartStore } from '@/lib/store/cart';
import { ORDER_CONFIRM_CONTENT } from './content';

export interface ConfirmItem {
  nameRo: string;
  nameEn: string;
  quantity: number;
  lineTotalRon: number;
  engravingText: string | null;
}

export interface ConfirmOrder {
  orderId: string;
  orderNumber: string;
  paymentMethod: string | null;
  paymentStatus: string;
  totalRon: number;
  shipping: {
    recipientName: string;
    street: string;
    city: string;
    county: string;
    postalCode: string;
    phone: string;
  } | null;
}

export default function MultumimContent({
  locale,
  order,
  items,
}: {
  locale: Locale;
  order: ConfirmOrder;
  items: ConfirmItem[];
}) {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const c = ORDER_CONFIRM_CONTENT[locale];

  // Clear the cart on a successful confirmation (D6 — only here, not on cancel).
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const statusMessage =
    order.paymentMethod === 'cod'
      ? c.statusCod
      : order.paymentStatus === 'paid'
        ? c.statusPaid
        : c.statusPendingPayment;

  const toggleLanguage = () =>
    router.push(`${localizedPath('multumim', locale === 'ro' ? 'en' : 'ro')}/${order.orderId}`);

  const sh = order.shipping;

  return (
    <div>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} />
      <main style={{ backgroundColor: 'var(--cream-warm)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(100px, 13vw, 140px) clamp(20px, 5vw, 56px) clamp(48px, 8vw, 90px)' }}>
          <CheckCircle2 size={48} strokeWidth={1.5} color="var(--moss)" aria-hidden />
          <h1 className="font-caudex" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', color: 'var(--oak-deep)', fontWeight: 700, marginTop: 16 }}>
            {c.title}
          </h1>
          <p className="font-lora" style={{ fontSize: '1.05rem', color: 'var(--ink-soft)', marginTop: 10, lineHeight: 1.6 }}>
            {c.intro}
          </p>

          <div
            style={{
              backgroundColor: 'var(--paper-aged)',
              border: '1px solid rgba(92,58,32,0.18)',
              borderRadius: 10,
              padding: '20px 22px',
              marginTop: 28,
            }}
          >
            <p className="font-lora" style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
              {c.orderNumberLabel}:{' '}
              <span className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700 }}>
                {order.orderNumber}
              </span>
            </p>
            <p className="font-lora" style={{ fontSize: '0.92rem', color: 'var(--ink)', marginTop: 8 }}>
              {statusMessage}
            </p>
          </div>

          {/* Items */}
          <h2 className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.62rem', marginTop: 28, marginBottom: 10 }}>
            {c.itemsHeading}
          </h2>
          <div className="flex flex-col gap-2.5">
            {items.map((it, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.92rem' }}>
                  {(locale === 'ro' ? it.nameRo : it.nameEn)} × {it.quantity}
                  {it.engravingText ? (
                    <span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}> · {c.engraving}: “{it.engravingText}”</span>
                  ) : null}
                </span>
                <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.92rem' }}>
                  {formatPriceRon(it.lineTotalRon, locale)} {c.priceUnit}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(92,58,32,0.15)', marginTop: 16, paddingTop: 14 }}>
            <span className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: '1.1rem' }}>
              {c.totalLabel}
            </span>
            <span className="font-caudex" style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '1.3rem' }}>
              {formatPriceRon(order.totalRon, locale)} {c.priceUnit}
            </span>
          </div>

          {/* Shipping */}
          {sh ? (
            <>
              <h2 className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.62rem', marginTop: 28, marginBottom: 8 }}>
                {c.shippingToHeading}
              </h2>
              <p className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem', lineHeight: 1.55 }}>
                {sh.recipientName}
                <br />
                {sh.street}
                <br />
                {sh.city}, {sh.county} {sh.postalCode}
                <br />
                {sh.phone}
              </p>
            </>
          ) : null}

          <div style={{ marginTop: 36 }}>
            <Link
              href={localizedPath('tocatoare', locale)}
              className="font-caudex transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: 'var(--oak-warm)', color: 'var(--cream-warm)', borderRadius: 8, padding: '13px 28px', fontSize: '0.95rem', letterSpacing: '0.03em' }}
            >
              {c.continueShopping}
            </Link>
          </div>
        </div>
      </main>
      <Footer language={locale} />
    </div>
  );
}
