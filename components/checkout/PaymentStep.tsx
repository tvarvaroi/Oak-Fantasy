'use client';

import { useFormContext, type UseFormRegister } from 'react-hook-form';

import { FieldError } from '@/components/auth/fields';
import { formatPriceRon } from '@/components/tocatoare/content';
import { shippingCost } from '@/lib/config/shipping';
import type { Locale } from '@/lib/i18n-routes';
import type { CheckoutData } from '@/lib/schemas/checkout';
import type { CheckoutContent } from './content';

function RadioCard({
  value,
  current,
  title,
  note,
  register,
}: {
  value: string;
  current: string;
  title: string;
  note: string;
  register: UseFormRegister<CheckoutData>;
}) {
  const selected = current === value;
  return (
    <label
      className="flex items-start gap-3 cursor-pointer transition-colors"
      style={{
        border: selected ? '2px solid var(--oak-warm)' : '1px solid rgba(92,58,32,0.22)',
        borderRadius: 10,
        padding: '16px 18px',
        backgroundColor: selected ? 'rgba(184,115,51,0.06)' : 'var(--paper-aged)',
      }}
    >
      <input type="radio" value={value} {...register('paymentMethod')} style={{ marginTop: 3, accentColor: 'var(--oak-warm)' }} />
      <span className="flex flex-col gap-0.5">
        <span className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: '0.98rem' }}>
          {title}
        </span>
        <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.84rem' }}>
          {note}
        </span>
      </span>
    </label>
  );
}

export default function PaymentStep({
  content,
  locale,
  subtotalBani,
}: {
  content: CheckoutContent;
  locale: Locale;
  subtotalBani: number;
}) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CheckoutData>();
  const c = content;
  const method = watch('paymentMethod');
  const ship = shippingCost(subtotalBani);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-caudex" style={{ fontSize: '1.3rem', color: 'var(--oak-deep)', fontWeight: 700 }}>
        {c.paymentHeading}
      </h2>

      <div className="flex flex-col gap-3">
        <RadioCard value="stripe_card" current={method} title={c.cardLabel} note={c.cardNote} register={register} />
        <RadioCard value="cod" current={method} title={c.codLabel} note={c.codNote} register={register} />
        <FieldError message={errors.paymentMethod?.message} />
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(92,58,32,0.15)',
          paddingTop: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.92rem' }}>
            {c.shippingCostLabel}
          </span>
          <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.92rem' }}>
            {ship === 0 ? c.freeShipping : `${formatPriceRon(ship, locale)} ${c.priceUnit}`}
          </span>
        </div>
        <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>
          {ship === 0 ? c.leadTime : `${c.freeShippingHint} ${c.leadTime}`}
        </p>
      </div>
    </div>
  );
}
