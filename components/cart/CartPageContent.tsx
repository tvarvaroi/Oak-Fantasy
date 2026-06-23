'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { useCartStore, cartSubtotal } from '@/lib/store/cart';
import { useHydrated } from '@/lib/hooks/useHydrated';
import { formatPriceRon } from '@/components/tocatoare/content';
import { CART_CONTENT } from './content';
import CartLineItem from './CartLineItem';

// Full cart page (/cos, /cart). Client — reads the persisted store behind a
// hydration guard (no #418, no misleading empty-cart flash for users who have
// items: render a neutral spacer until hydrated, then the real content).
export default function CartPageContent({ locale }: { locale: Locale }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const storeItems = useCartStore((s) => s.items);
  const items = hydrated ? storeItems : [];
  const c = CART_CONTENT[locale];
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  const subtotal = cartSubtotal(items);

  const toggleLanguage = () => {
    router.push(localizedPath('cos', locale === 'ro' ? 'en' : 'ro'));
  };

  return (
    <div>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} />
      <main style={{ backgroundColor: 'var(--cream-warm)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(90px, 12vw, 130px) clamp(20px, 5vw, 56px) clamp(48px, 8vw, 90px)' }}>
          <h1
            className="font-caudex"
            style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', color: 'var(--oak-deep)', fontWeight: 700, marginBottom: 32 }}
          >
            {c.title}
          </h1>

          {!hydrated ? (
            <div style={{ minHeight: 240 }} aria-hidden />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-start gap-4" style={{ minHeight: 240 }}>
              <p className="font-lora" style={{ fontSize: '1.05rem', color: 'var(--ink-soft)' }}>
                {c.empty}
              </p>
              <Link
                href={localizedPath('tocatoare', locale)}
                className="font-caudex transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: 'var(--oak-warm)',
                  color: 'var(--cream-warm)',
                  borderRadius: 8,
                  padding: '13px 28px',
                  fontSize: '0.95rem',
                  letterSpacing: '0.03em',
                }}
              >
                {c.emptyCta}
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_320px] items-start">
              {/* Items */}
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <CartLineItem key={item.lineId} item={item} locale={locale} content={c} />
                ))}
              </div>

              {/* Summary */}
              <aside
                style={{
                  backgroundColor: 'var(--paper-aged)',
                  border: '1px solid rgba(92,58,32,0.18)',
                  borderRadius: 10,
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  position: 'sticky',
                  top: 100,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: '1.05rem' }}>
                    {c.subtotal}
                  </span>
                  <span className="font-caudex" style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '1.25rem' }}>
                    {formatPriceRon(subtotal, locale)} {c.priceUnit}
                  </span>
                </div>
                <p className="font-lora" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
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
                    padding: '14px',
                    fontSize: '0.98rem',
                    letterSpacing: '0.03em',
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
                  href={localizedPath('tocatoare', locale)}
                  className="font-caudex text-center"
                  style={{ color: 'var(--oak-warm)', textDecoration: 'underline', fontSize: '0.88rem' }}
                >
                  {c.emptyCta}
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer language={locale} />
    </div>
  );
}
