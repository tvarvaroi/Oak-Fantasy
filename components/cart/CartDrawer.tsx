'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

import { useCartStore, cartSubtotal } from '@/lib/store/cart';
import { useHydrated } from '@/lib/hooks/useHydrated';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { formatPriceRon } from '@/components/tocatoare/content';
import { CART_CONTENT } from './content';
import CartLineItem from './CartLineItem';

export default function CartDrawer({ locale }: { locale: Locale }) {
  const hydrated = useHydrated();
  const storeItems = useCartStore((s) => s.items);
  const storeOpen = useCartStore((s) => s.isOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  const c = CART_CONTENT[locale];
  // SSR + first client render = closed + empty, matching the server HTML.
  const items = hydrated ? storeItems : [];
  const isOpen = hydrated && storeOpen;

  // Esc to close + body scroll lock while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closeDrawer]);

  const subtotal = cartSubtotal(items);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(31,24,16,0.4)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          zIndex: 60,
        }}
      />

      {/* Panel */}
      <aside
        aria-label={c.cartAria}
        aria-hidden={!isOpen}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100dvh',
          width: 'min(420px, 90vw)',
          backgroundColor: 'var(--cream-warm)',
          boxShadow: '-8px 0 32px rgba(31,24,16,0.18)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 61,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '20px 22px', borderBottom: '1px solid rgba(92,58,32,0.18)' }}
        >
          <span className="font-caudex" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--oak-deep)' }}>
            {c.title}
          </span>
          <button type="button" onClick={closeDrawer} aria-label={c.close} className="transition-opacity hover:opacity-70" style={{ color: 'var(--ink-soft)' }}>
            <X size={22} strokeWidth={1.75} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ height: '100%', gap: 14 }}>
              <p className="font-lora" style={{ color: 'var(--ink-soft)' }}>
                {c.empty}
              </p>
              <Link
                href={localizedPath('tocatoare', locale)}
                onClick={closeDrawer}
                className="font-caudex"
                style={{ color: 'var(--oak-warm)', textDecoration: 'underline', fontSize: '0.9rem' }}
              >
                {c.emptyCta}
              </Link>
            </div>
          ) : (
            items.map((item) => <CartLineItem key={item.lineId} item={item} locale={locale} content={c} compact />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 ? (
          <div style={{ padding: '18px 22px', borderTop: '1px solid rgba(92,58,32,0.18)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="flex items-center justify-between">
              <span className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700 }}>
                {c.subtotal}
              </span>
              <span className="font-caudex" style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '1.1rem' }}>
                {formatPriceRon(subtotal, locale)} {c.priceUnit}
              </span>
            </div>
            <p className="font-lora" style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
              {c.shippingNote}
            </p>

            <button
              type="button"
              onClick={() => setCheckoutNotice(true)}
              className="font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
              style={{
                backgroundColor: 'var(--oak-warm)',
                color: 'var(--cream-warm)',
                borderRadius: 8,
                padding: '13px',
                fontSize: '0.95rem',
                letterSpacing: '0.03em',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 4px rgba(31,24,16,0.18)',
              }}
            >
              {c.checkout}
            </button>
            {checkoutNotice ? (
              <p className="font-lora text-center" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }} role="status">
                {c.checkoutComingSoon}
              </p>
            ) : null}

            <Link
              href={localizedPath('cos', locale)}
              onClick={closeDrawer}
              className="font-caudex text-center"
              style={{ color: 'var(--oak-warm)', textDecoration: 'underline', fontSize: '0.88rem' }}
            >
              {c.viewCart}
            </Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}
