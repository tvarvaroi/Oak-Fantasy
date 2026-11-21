import type { ReactNode } from 'react';
import Link from 'next/link';

import { localizedPath, type Locale } from '@/lib/i18n-routes';
import {
  DISPATCH_WORKING_DAYS,
  FREE_SHIPPING_THRESHOLD_RON,
  SHIPPING_FLAT_RON,
  TRANSIT_WORKING_DAYS,
} from '@/lib/config/shipping';
import { RETURN_WINDOW_DAYS } from '@/lib/config/returns';
import { CARD_PAYMENTS_ENABLED } from '@/lib/config/payments';
import { noBreakRanges } from '@/lib/no-break-ranges';
import { keepUnits } from '@/lib/typography';
import { PRODUCT_DETAIL_CONTENT } from './content';

// "Livrare, plată și retur" on the product page (GEO audit 2026-11-21): the
// answers a buyer — or an assistant reading only this page — needs, in plain
// words. Until now payment was stated only in the Terms and returns only on
// /retur and in the JSON-LD.
//
// No number is written here: every figure comes from the configs that already
// drive the checkout total (lib/config/shipping.ts), the Terms ({shippingFee},
// {freeShippingFrom} tokens) and the Product JSON-LD (dispatch, transit,
// return window). The sentences restate the Terms and the /retur summary.
// Server component.

const ron = (bani: number) => `${bani / 100} RON`;

const TOKENS: Record<string, string> = {
  fee: ron(SHIPPING_FLAT_RON),
  free: ron(FREE_SHIPPING_THRESHOLD_RON),
  dispatch: `${DISPATCH_WORKING_DAYS.min}–${DISPATCH_WORKING_DAYS.max}`,
  transit: `${TRANSIT_WORKING_DAYS.min}–${TRANSIT_WORKING_DAYS.max}`,
  returnDays: String(RETURN_WINDOW_DAYS),
};

function fill(template: string): ReactNode[] {
  // Same rule as components/legal/LegalText.tsx: a mistyped token must fail
  // the build, never reach a product page as "{returnDay}".
  const text = template.replace(/\{([a-zA-Z]+)\}/g, (match, name: string) => {
    if (!Object.prototype.hasOwnProperty.call(TOKENS, name)) {
      throw new Error(`Unknown buyingInfo token: ${match}`);
    }
    return TOKENS[name];
  });
  return noBreakRanges(keepUnits(text));
}

// Two links on their own row (not inside a sentence): each is a real
// 44px-tall touch target and the row keeps an even rhythm when it wraps.
const LINK_STYLE = {
  color: 'var(--oak-warm)',
  textDecoration: 'underline',
  textUnderlineOffset: 3,
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 44,
} as const;

export default function BuyingInfo({ locale }: { locale: Locale }) {
  const c = PRODUCT_DETAIL_CONTENT[locale].buyingInfo;

  const rows = [
    // The payment row describes cash on delivery as the only method. If card
    // payments are ever switched on (lib/config/payments.ts) it would be
    // wrong, so it is hidden until the copy is rewritten for both methods.
    ...(CARD_PAYMENTS_ENABLED ? [] : [{ key: 'payment', label: c.paymentLabel, text: c.payment }]),
    { key: 'delivery', label: c.deliveryLabel, text: c.delivery },
    { key: 'timing', label: c.timingLabel, text: c.timing },
    { key: 'returns', label: c.returnsLabel, text: c.returns },
  ];

  return (
    <section
      aria-labelledby="buying-info-heading"
      data-testid="buying-info"
      style={{ borderTop: '1px solid rgba(92,58,32,0.15)', paddingTop: 22 }}
    >
      <h2
        id="buying-info-heading"
        className="font-caudex"
        style={{ fontSize: '1.2rem', color: 'var(--oak-deep)', fontWeight: 700, lineHeight: 1.25, marginBottom: 14 }}
      >
        {c.title}
      </h2>

      <dl className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.key} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
            <dt
              className="label-caps sm:shrink-0"
              style={{ color: 'var(--ink-soft)', fontSize: '0.62rem', minWidth: 110, paddingTop: 6 }}
            >
              {row.label}
            </dt>
            <dd className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '1rem', lineHeight: 1.7 }}>
              {fill(row.text)}
            </dd>
          </div>
        ))}
      </dl>

      <p className="font-lora flex flex-wrap" style={{ columnGap: 28, fontSize: '1rem', lineHeight: 1.4, marginTop: 10 }}>
        <Link href={localizedPath('returns', locale)} style={LINK_STYLE}>
          {c.moreReturns}
        </Link>
        <Link href={localizedPath('terms', locale)} style={LINK_STYLE}>
          {c.moreTerms}
        </Link>
      </p>
    </section>
  );
}
