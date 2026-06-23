'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2, ImageOff } from 'lucide-react';

import { useCartStore, type CartItem } from '@/lib/store/cart';
import { formatPriceRon } from '@/components/tocatoare/content';
import type { Locale } from '@/lib/i18n-routes';
import type { CartContent } from './content';

export default function CartLineItem({
  item,
  locale,
  content,
  compact = false,
}: {
  item: CartItem;
  locale: Locale;
  content: CartContent;
  compact?: boolean;
}) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const name = locale === 'ro' ? item.name_ro : item.name_en;
  const unitPrice = item.priceRon + (item.engraving?.priceRon ?? 0);
  const lineTotal = unitPrice * item.quantity;
  const thumb = compact ? 60 : 84;

  return (
    <div className="flex gap-3" style={{ paddingBottom: 16, borderBottom: '1px solid rgba(92,58,32,0.12)' }}>
      <div
        className="relative overflow-hidden flex items-center justify-center shrink-0"
        style={{ width: thumb, height: thumb, borderRadius: 8, backgroundColor: 'var(--paper-aged)' }}
      >
        {item.heroImageUrl ? (
          <Image src={item.heroImageUrl} alt="" fill sizes={`${thumb}px`} style={{ objectFit: 'cover' }} />
        ) : (
          <ImageOff size={18} color="var(--ink-soft)" strokeWidth={1.5} aria-hidden />
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0 gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: compact ? '0.92rem' : '1rem', lineHeight: 1.2 }}>
            {name}
          </span>
          <button
            type="button"
            onClick={() => removeItem(item.lineId)}
            aria-label={content.remove}
            className="shrink-0 transition-opacity hover:opacity-70"
            style={{ color: 'var(--ink-soft)' }}
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </div>

        {item.engraving?.text ? (
          <span className="font-lora" style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
            {content.engraving}: “{item.engraving.text}”
          </span>
        ) : null}

        <div className="flex items-center justify-between gap-2 mt-1">
          {/* Quantity stepper */}
          <div className="flex items-center" style={{ border: '1px solid rgba(92,58,32,0.25)', borderRadius: 6 }}>
            <button
              type="button"
              onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
              aria-label="-"
              className="flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ width: 28, height: 28, color: 'var(--oak-deep)' }}
            >
              <Minus size={14} strokeWidth={2} />
            </button>
            <span className="font-lora" style={{ minWidth: 24, textAlign: 'center', fontSize: '0.88rem', color: 'var(--ink)' }}>
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
              aria-label="+"
              className="flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ width: 28, height: 28, color: 'var(--oak-deep)' }}
            >
              <Plus size={14} strokeWidth={2} />
            </button>
          </div>

          <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.92rem', fontWeight: 500 }}>
            {formatPriceRon(lineTotal, locale)} {content.priceUnit}
          </span>
        </div>
      </div>
    </div>
  );
}
