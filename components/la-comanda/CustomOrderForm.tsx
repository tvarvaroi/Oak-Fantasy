'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { submitCustomOrder } from '@/lib/custom-orders/submit';
import {
  CUSTOM_ORDER_LIMITS,
  customOrderFieldsSchema,
  type CustomOrderErrorCode,
  type CustomOrderField,
  type CustomOrderFields,
} from '@/lib/schemas/custom-order';

import type { CustomOrderCopy } from './content';
import styles from './la-comanda.module.css';

// The order slip = the /la-comanda form (2026-11-18). Name + phone + idea, no
// other fields. Same Zod rules as the server action; messages are error codes
// mapped to RO/EN copy. Bot defences mirror the contact form: hidden honeypot
// `website` + ms since mount (server drops < 2s silently).
// After the server confirms the request (res.ok) the visitor is sent to the
// confirmation page (/la-comanda/sent) — a distinct URL that Web Analytics can
// count. Nothing about the request travels in that URL.

export const SLIP_ID = 'formular';
export const NAME_FIELD_ID = 'co-name';

export default function CustomOrderForm({
  copy,
  locale,
}: {
  copy: CustomOrderCopy['form'];
  locale: Locale;
}) {
  const router = useRouter();
  const mountedAt = useRef(0);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomOrderFields>({
    resolver: zodResolver(customOrderFieldsSchema),
    defaultValues: { name: '', phone: '', idea: '' },
    mode: 'onTouched',
  });

  const ideaLength = (watch('idea') ?? '').length;
  const message = (field: CustomOrderField) => {
    const code = errors[field]?.message as CustomOrderErrorCode | undefined;
    return code ? (copy.errors[code] ?? copy.errorGeneric) : undefined;
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const res = await submitCustomOrder({
        ...values,
        website: honeypotRef.current?.value ?? '',
        elapsedMs: mountedAt.current ? Date.now() - mountedAt.current : undefined,
        locale,
      });
      if (res.ok) {
        reset();
        router.push(localizedPath('laComandaSent', locale));
        return;
      }
      if (res.error === 'validation' && res.fieldErrors) {
        for (const [field, code] of Object.entries(res.fieldErrors)) {
          setError(field as CustomOrderField, { message: code });
        }
        return;
      }
      setFormError(res.error === 'rate_limited' ? copy.errorRateLimited : copy.errorGeneric);
    } catch {
      setFormError(copy.errorGeneric);
    }
  });

  const nameError = message('name');
  const phoneError = message('phone');
  const ideaError = message('idea');

  return (
    <div id={SLIP_ID} className={styles.slip} tabIndex={-1}>
      <div className={styles.slipHead}>
        <h2 className={styles.slipTitle}>{copy.heading}</h2>
      </div>

      <form className={styles.form} onSubmit={onSubmit} noValidate data-testid="custom-order-form">
        <div>
          <label htmlFor={NAME_FIELD_ID} className={styles.fieldLabel}>
            {copy.fields.name.label}
          </label>
          <input
            id={NAME_FIELD_ID}
            type="text"
            autoComplete="name"
            placeholder={copy.fields.name.placeholder}
            maxLength={CUSTOM_ORDER_LIMITS.nameMax}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? 'co-name-error' : undefined}
            className={`${styles.input} ${nameError ? styles.invalid : ''}`}
            {...register('name')}
          />
          {nameError ? (
            <p id="co-name-error" className={styles.error} role="alert">
              {nameError}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="co-phone" className={styles.fieldLabel}>
            {copy.fields.phone.label}
          </label>
          <input
            id="co-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={copy.fields.phone.placeholder}
            maxLength={20}
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={phoneError ? 'co-phone-error co-phone-hint' : 'co-phone-hint'}
            className={`${styles.input} ${phoneError ? styles.invalid : ''}`}
            {...register('phone')}
          />
          {phoneError ? (
            <p id="co-phone-error" className={styles.error} role="alert">
              {phoneError}
            </p>
          ) : null}
          <p id="co-phone-hint" className={styles.hint} style={{ marginTop: 6 }}>
            {copy.fields.phone.hint}
          </p>
        </div>

        <div>
          <label htmlFor="co-idea" className={styles.fieldLabel}>
            {copy.fields.idea.label}
          </label>
          <textarea
            id="co-idea"
            rows={5}
            placeholder={copy.fields.idea.placeholder}
            maxLength={CUSTOM_ORDER_LIMITS.ideaMax}
            aria-invalid={ideaError ? true : undefined}
            aria-describedby={ideaError ? 'co-idea-error co-idea-count' : 'co-idea-count'}
            className={`${styles.textarea} ${ideaError ? styles.invalid : ''}`}
            {...register('idea')}
          />
          <div className={styles.fieldMeta}>
            {ideaError ? (
              <p id="co-idea-error" className={styles.error} role="alert" style={{ marginTop: 0 }}>
                {ideaError}
              </p>
            ) : null}
            <span id="co-idea-count" className={styles.counter}>
              {copy.fields.idea.counter
                .replace('{count}', String(ideaLength))
                .replace('{max}', String(CUSTOM_ORDER_LIMITS.ideaMax))}
            </span>
          </div>
        </div>

        {/* Honeypot — invisible to people and to assistive tech; bots fill it. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="co-website">Website</label>
          <input id="co-website" ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        {formError ? (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        ) : null}

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? copy.submitLoading : copy.submitIdle}
        </button>
      </form>

      <div className={styles.fine}>
        <p>
          {copy.consent.lead}
          <Link href={localizedPath('privacy', locale)}>{copy.consent.link}</Link>
          {copy.consent.tail}
        </p>
        <p>
          {copy.returns.lead}
          <Link href={localizedPath('returns', locale)}>{copy.returns.link}</Link>
          {copy.returns.tail}
        </p>
      </div>
    </div>
  );
}
