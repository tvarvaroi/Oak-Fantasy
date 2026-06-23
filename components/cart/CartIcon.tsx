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
      className="relative flex items-center transition-colors duration-200 hover:opacity-80"
      style={{ color, transition: colorTransition }}
    >
      <ShoppingBag size={22} strokeWidth={1.75} aria-hidden />
      {count > 0 ? (
        <span
          className="font-caudex"
          style={{
            position: 'absolute',
            top: -7,
            right: -9,
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
