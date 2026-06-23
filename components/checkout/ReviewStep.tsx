'use client';

import Link from 'next/link';
import { useFormContext } from 'react-hook-form';

import { FieldError } from '@/components/auth/fields';
import { formatPriceRon } from '@/components/tocatoare/content';
import { shippingCost } from '@/lib/config/shipping';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import type { CartItem } from '@/lib/store/cart';
import type { CheckoutData } from '@/lib/schemas/checkout';
import type { CheckoutContent } from './content';

export default function ReviewStep({
  content,
  locale,
  items,
  subtotalBani,
}: {
  content: CheckoutContent;
  locale: Locale;
  items: CartItem[];
  subtotalBani: number;
}) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CheckoutData>();
  const c = content;

  const ship = shippingCost(subtotalBani);
  const total = subtotalBani + ship;
  const d = watch();
  const paymentLabel = d.paymentMethod === 'stripe_card' ? c.cardLabel : c.codLabel;

  const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-caudex" style={{ fontSize: '1.3rem', color: 'var(--oak-deep)', fontWeight: 700 }}>
        {c.reviewHeading}
      </h2>

      {/* Items */}
      <div className="flex flex-col gap-3" style={{ borderBottom: '1px solid rgba(92,58,32,0.15)', paddingBottom: 16 }}>
        {items.map((item) => {
          const name = locale === 'ro' ? item.name_ro : item.name_en;
          const unit = item.priceRon + (item.engraving?.priceRon ?? 0);
          return (
            <div key={item.lineId} style={rowStyle}>
              <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>
                {name} × {item.quantity}
                {item.engraving?.text ? (
                  <span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}> · {c.engraving}: “{item.engraving.text}”</span>
                ) : null}
              </span>
              <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>
                {formatPriceRon(unit * item.quantity, locale)} {c.priceUnit}
              </span>
            </div>
          );
        })}
      </div>

      {/* Shipping + payment summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.6rem', marginBottom: 4 }}>
            {c.shippingToLabel}
          </p>
          <p className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.88rem', lineHeight: 1.55 }}>
            {d.fullName}
            <br />
            {d.street}
            <br />
            {d.city}, {d.county} {d.postalCode}
            <br />
            {d.phone}
          </p>
        </div>
        <div>
          <p className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.6rem', marginBottom: 4 }}>
            {c.paymentLabel}
          </p>
          <p className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.88rem' }}>
            {paymentLabel}
          </p>
        </div>
      </div>

      {/* Totals */}
      <div className="flex flex-col gap-2" style={{ borderTop: '1px solid rgba(92,58,32,0.15)', paddingTop: 16 }}>
        <div style={rowStyle}>
          <span className="font-lora" style={{ color: 'var(--ink-soft)' }}>{c.subtotal}</span>
          <span className="font-lora" style={{ color: 'var(--ink)' }}>{formatPriceRon(subtotalBani, locale)} {c.priceUnit}</span>
        </div>
        <div style={rowStyle}>
          <span className="font-lora" style={{ color: 'var(--ink-soft)' }}>{c.shippingCostLabel}</span>
          <span className="font-lora" style={{ color: 'var(--ink)' }}>{ship === 0 ? c.freeShipping : `${formatPriceRon(ship, locale)} ${c.priceUnit}`}</span>
        </div>
        <div style={{ ...rowStyle, marginTop: 4 }}>
          <span className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: '1.1rem' }}>{c.total}</span>
          <span className="font-caudex" style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '1.3rem' }}>{formatPriceRon(total, locale)} {c.priceUnit}</span>
        </div>
      </div>

      {/* Terms */}
      <div>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" {...register('termsAccepted')} style={{ marginTop: 3, accentColor: 'var(--oak-warm)' }} />
          <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.88rem' }}>
            {c.termsPrefix}{' '}
            <Link href={localizedPath('terms', locale)} target="_blank" style={{ color: 'var(--oak-warm)', textDecoration: 'underline' }}>
              {c.termsLink}
            </Link>
            .
          </span>
        </label>
        <FieldError message={errors.termsAccepted?.message} />
      </div>
    </div>
  );
}
