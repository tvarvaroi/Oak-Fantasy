'use client';

import Link from 'next/link';
import { useFormContext } from 'react-hook-form';

import { FieldError } from '@/components/auth/fields';
import { formatPriceRon } from '@/components/tocatoare/content';
import { shippingCost } from '@/lib/config/shipping';
import { CARD_PAYMENTS_ENABLED } from '@/lib/config/payments';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import type { CartItem } from '@/lib/store/cart';
import type { CheckoutData } from '@/lib/schemas/checkout';
import type { CheckoutContent } from './content';
import { noBreakRanges } from '@/lib/no-break-ranges';
import { keepUnits } from '@/lib/typography';

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
  const hasEngraving = items.some((item) => Boolean(item.engraving?.text));

  const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

  // Ramburs-only mode (card payments dormant, 2026-10-15): there is no payment
  // step, so the review step carries the cash-on-delivery panel + the delivery
  // lead time that used to live in PaymentStep.
  const codPanel = (
    <div
      style={{
        backgroundColor: 'var(--paper-aged)',
        border: '1px solid rgba(92,58,32,0.2)',
        borderLeft: '3px solid var(--oak-warm)',
        borderRadius: '0 8px 8px 0',
        padding: '12px 14px',
      }}
      data-testid="cod-info"
    >
      <p className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: '0.95rem' }}>
        {c.codInfoTitle}
      </p>
      <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.84rem', lineHeight: 1.55, marginTop: 2 }}>
        {c.codInfoBody}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-caudex" style={{ fontSize: '1.3rem', color: 'var(--oak-deep)', fontWeight: 700 }}>
        {c.reviewHeading}
      </h2>

      {/* Items */}
      <div className="flex flex-col gap-3" style={{ borderBottom: '1px solid rgba(92,58,32,0.15)', paddingBottom: 16 }}>
        {items.map((item) => {
          const name = keepUnits(locale === 'ro' ? item.name_ro : item.name_en);
          const unit = item.priceRon + (item.engraving?.priceRon ?? 0);
          return (
            // Long product names wrap on their own column; the price never breaks
            // ("180 / RON") and keeps a gap from the name (design-qa 2026-11-19).
            <div key={item.lineId} style={{ ...rowStyle, alignItems: 'flex-start', gap: 16 }}>
              <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem', flex: '1 1 auto', minWidth: 0 }}>
                <span style={{ display: 'block' }}>{name}</span>
                {/* Quantity on its own line: "480 mm × 1" read as a size (2026-11-19). */}
                <span style={{ display: 'block', color: 'var(--ink-soft)', fontSize: '0.8rem', marginTop: 2 }}>
                  {c.quantityLabel}: {item.quantity}
                  {item.engraving?.text ? <> · {c.engraving}: “{item.engraving.text}”</> : null}
                </span>
              </span>
              <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
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
          {CARD_PAYMENTS_ENABLED ? (
            <p className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.88rem' }}>
              {paymentLabel}
            </p>
          ) : (
            codPanel
          )}
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
        {/* VAT status (final legal data, 2026-07-11): non-VAT-payer — prices final */}
        <p className="font-lora" style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 6, opacity: 0.85 }}>
          {c.vatNote}
        </p>
        {!CARD_PAYMENTS_ENABLED ? (
          <p className="font-lora" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
            {noBreakRanges(ship === 0 ? c.leadTime : `${c.freeShippingHint} ${c.leadTime}`)}
          </p>
        ) : null}
      </div>

      {/* Terms */}
      <div>
        {/* The whole label is the touch target (≥ 44px tall); the box itself is 20px. */}
        <label className="flex items-start gap-3 cursor-pointer" style={{ minHeight: 44, paddingTop: 10, paddingBottom: 10 }}>
          <input
            type="checkbox"
            {...register('termsAccepted')}
            style={{ width: 20, height: 20, marginTop: 1, flexShrink: 0, accentColor: 'var(--oak-warm)' }}
          />
          <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.88rem' }}>
            {c.termsPrefix}{' '}
            <Link href={localizedPath('terms', locale)} target="_blank" style={{ color: 'var(--oak-warm)', textDecoration: 'underline' }}>
              {c.termsLink}
            </Link>
            .
          </span>
        </label>
        <FieldError message={errors.termsAccepted?.message} />

        {/* OUG 34/2014 art. 16 lit. c: engraved goods have no right of
            withdrawal, but only if the customer is told before ordering —
            so the notice sits right next to the checkbox, and only when the
            cart actually holds an engraved line. */}
        {hasEngraving ? (
          <p
            className="font-lora"
            role="note"
            data-testid="engraving-withdrawal-notice"
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderLeft: '3px solid var(--copper)',
              backgroundColor: 'rgba(184,115,51,0.08)',
              borderRadius: '0 6px 6px 0',
              color: 'var(--ink)',
              fontSize: '0.86rem',
              lineHeight: 1.55,
            }}
          >
            {c.engravingNotice}{' '}
            <Link
              href={`${localizedPath('returns', locale)}#exceptions`}
              target="_blank"
              style={{ color: 'var(--oak-warm)', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              {c.engravingNoticeLink}
            </Link>
            .
          </p>
        ) : null}

        <p
          className="font-lora"
          data-testid="checkout-privacy-note"
          style={{ marginTop: 10, color: 'var(--ink-soft)', fontSize: '0.8rem', lineHeight: 1.55 }}
        >
          {c.privacyPrefix}{' '}
          <Link
            href={localizedPath('privacy', locale)}
            target="_blank"
            style={{ color: 'var(--oak-warm)', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            {c.privacyLink}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
