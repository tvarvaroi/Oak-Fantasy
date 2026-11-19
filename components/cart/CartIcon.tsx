'use client';

import { ShoppingBag } from 'lucide-react';

import { useCartStore, cartTotalItems } from '@/lib/store/cart';
import { useHydrated } from '@/lib/hooks/useHydrated';
import { CART_CONTENT } from './content';
import type { Locale } from '@/lib/i18n-routes';

// Cart trigger in the Navbar. Badge count is gated by useHydrated so SSR + the
// first client render show no badge (matching server HTML), then the real count
// appears after the persisted store rehydrates — no #418.
export default function CartIcon({
  locale,
  color,
  colorTransition,
}: {
  locale: Locale;
  color: string;
  colorTransition?: string;
}) {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const c = CART_CONTENT[locale];
  const count = hydrated ? cartTotalItems(items) : 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`${c.cartAria}${count > 0 ? ` (${count})` : ''}`}
      className="relative flex items-center justify-center transition-colors duration-200 hover:opacity-80"
      // 44×44 touch target around the 22px icon; the negative margin keeps the
      // icon exactly where it sat in the navbar (design-qa 2026-11-19).
      style={{ color, transition: colorTransition, width: 44, height: 44, margin: -11 }}
    >
      <ShoppingBag size={22} strokeWidth={1.75} aria-hidden />
      {count > 0 ? (
        <span
          className="font-caudex"
          style={{
            position: 'absolute',
            top: 4,
            right: 2,
            minWidth: 17,
            height: 17,
            padding: '0 4px',
            borderRadius: 999,
            backgroundColor: 'var(--copper)',
            color: 'var(--cream-warm)',
            fontSize: '0.62rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
