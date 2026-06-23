'use client';

import Link from 'next/link';
import { useFormContext } from 'react-hook-form';

import { FieldLabel, FieldError, inputBaseStyle, errorInputStyle } from '@/components/auth/fields';
import { RO_COUNTIES } from '@/lib/data/counties';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import type { CheckoutData } from '@/lib/schemas/checkout';
import type { CheckoutContent } from './content';

export default function ShippingStep({
  content,
  locale,
  isLoggedIn,
  email,
}: {
  content: CheckoutContent;
  locale: Locale;
  isLoggedIn: boolean;
  email: string | undefined;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutData>();
  const c = content;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-caudex" style={{ fontSize: '1.3rem', color: 'var(--oak-deep)', fontWeight: 700 }}>
        {c.shippingHeading}
      </h2>

      {isLoggedIn && email ? (
        <p className="font-lora" style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
          {c.orderingAsPrefix} <span style={{ color: 'var(--oak-deep)', fontWeight: 500 }}>{email}</span>.
        </p>
      ) : (
        <p className="font-lora" style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
          {c.loginPrompt}{' '}
          <Link href={localizedPath('login', locale)} style={{ color: 'var(--oak-warm)', textDecoration: 'underline' }}>
            {c.loginLink}
          </Link>
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="co-email">{c.email}</FieldLabel>
          <input id="co-email" type="email" autoComplete="email" style={errors.email ? errorInputStyle : inputBaseStyle} {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <FieldLabel htmlFor="co-name">{c.fullName}</FieldLabel>
          <input id="co-name" autoComplete="name" style={errors.fullName ? errorInputStyle : inputBaseStyle} {...register('fullName')} />
          <FieldError message={errors.fullName?.message} />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="co-phone">{c.phone}</FieldLabel>
        <input id="co-phone" type="tel" autoComplete="tel" placeholder={c.phonePlaceholder} style={errors.phone ? errorInputStyle : inputBaseStyle} {...register('phone')} />
        <FieldError message={errors.phone?.message} />
      </div>

      <div>
        <FieldLabel htmlFor="co-street">{c.street}</FieldLabel>
        <input id="co-street" autoComplete="street-address" placeholder={c.streetPlaceholder} style={errors.street ? errorInputStyle : inputBaseStyle} {...register('street')} />
        <FieldError message={errors.street?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <FieldLabel htmlFor="co-city">{c.city}</FieldLabel>
          <input id="co-city" autoComplete="address-level2" style={errors.city ? errorInputStyle : inputBaseStyle} {...register('city')} />
          <FieldError message={errors.city?.message} />
        </div>
        <div>
          <FieldLabel htmlFor="co-county">{c.county}</FieldLabel>
          <select id="co-county" style={errors.county ? errorInputStyle : inputBaseStyle} {...register('county')} defaultValue="">
            <option value="" disabled>
              {c.countyPlaceholder}
            </option>
            {RO_COUNTIES.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
          <FieldError message={errors.county?.message} />
        </div>
        <div>
          <FieldLabel htmlFor="co-postal">{c.postalCode}</FieldLabel>
          <input id="co-postal" inputMode="numeric" autoComplete="postal-code" style={errors.postalCode ? errorInputStyle : inputBaseStyle} {...register('postalCode')} />
          <FieldError message={errors.postalCode?.message} />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="co-notes" optional={c.optional}>
          {c.notes}
        </FieldLabel>
        <textarea id="co-notes" rows={2} placeholder={c.notesPlaceholder} style={{ ...inputBaseStyle, resize: 'vertical' }} {...register('notes')} />
        <FieldError message={errors.notes?.message} />
      </div>
    </div>
  );
}
