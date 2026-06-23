'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { Switch } from '@/components/ui/switch';
import { useCartStore, MAX_QTY } from '@/lib/store/cart';
import { formatPriceRon } from '@/components/tocatoare/content';
import { CART_CONTENT } from '@/components/cart/content';
import type { Locale } from '@/lib/i18n-routes';

export interface AddToCartProduct {
  productId: string;
  slug: string;
  name_ro: string;
  name_en: string;
  priceRon: number; // bani
  heroImageUrl: string | null;
  hasEngraving: boolean;
  engravingPriceRon: number | null; // bani
}

// Quantity + optional engraving + add-to-cart, wired to the Zustand store (D3,
// D4, D6). Client island rendered by the (server) ProductInfo.
export default function AddToCartPanel({ product, locale }: { product: AddToCartProduct; locale: Locale }) {
  const addItem = useCartStore((s) => s.addItem);
  const c = CART_CONTENT[locale];

  const [quantity, setQuantity] = useState(1);
  const [engravingEnabled, setEngravingEnabled] = useState(false);
  const [engravingText, setEngravingText] = useState('');

  const engravingPrice = product.engravingPriceRon ?? 0;

  const onAdd = () => {
    const text = engravingText.trim();
    const engraving =
      product.hasEngraving && engravingEnabled && text
        ? { text, priceRon: engravingPrice }
        : undefined;
    addItem(
      {
        productId: product.productId,
        slug: product.slug,
        name_ro: product.name_ro,
        name_en: product.name_en,
        priceRon: product.priceRon,
        heroImageUrl: product.heroImageUrl,
        engraving,
      },
      quantity,
    );
    // Store auto-opens the drawer (D6).
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Engraving (D4) */}
      {product.hasEngraving ? (
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Switch checked={engravingEnabled} onCheckedChange={setEngravingEnabled} aria-label={c.engravingToggle} />
            <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.92rem' }}>
              {c.engravingToggle}
              {product.engravingPriceRon != null ? (
                <span style={{ color: 'var(--copper)', marginLeft: 6 }}>
                  +{formatPriceRon(engravingPrice, locale)} {c.priceUnit}
                </span>
              ) : null}
            </span>
          </label>
          {engravingEnabled ? (
            <input
              type="text"
              value={engravingText}
              onChange={(e) => setEngravingText(e.target.value)}
              maxLength={80}
              placeholder={c.engravingPlaceholder}
              style={{
                fontFamily: 'var(--font-lora)',
                backgroundColor: 'var(--cream-warm)',
                color: 'var(--ink)',
                border: '1px solid var(--oak-warm)',
                borderRadius: 4,
                padding: '11px 13px',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            />
          ) : null}
        </div>
      ) : null}

      {/* Quantity (D3) + Add */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center" style={{ border: '1px solid rgba(92,58,32,0.3)', borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="-"
            className="flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ width: 42, height: 48, color: 'var(--oak-deep)' }}
          >
            <Minus size={16} strokeWidth={2} />
          </button>
          <span className="font-caudex" style={{ minWidth: 34, textAlign: 'center', fontSize: '1.05rem', color: 'var(--ink)' }}>
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
            aria-label="+"
            className="flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ width: 42, height: 48, color: 'var(--oak-deep)' }}
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            backgroundColor: 'var(--oak-warm)',
            color: 'var(--cream-warm)',
            borderRadius: 8,
            letterSpacing: '0.04em',
            padding: '15px 36px',
            fontSize: '1rem',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 6px rgba(31,24,16,0.2)',
          }}
        >
          {c.addToCart}
        </button>
      </div>
    </div>
  );
}
