'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';

import {
  CONTACT_SUBJECTS,
  SUBJECT_LABELS,
  type ContactFormData,
  type ContactSubject,
  contactFormSchema,
} from '@/lib/schemas/contact';
import type { Locale } from '@/lib/i18n-routes';

import type { ContactCopy } from './content';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface ContactFormProps {
  copy: ContactCopy['form'];
  locale: Locale;
}

const errorRed = '#9F2D20';

const inputBaseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-lora)',
  backgroundColor: 'var(--cream-warm)',
  color: 'var(--ink)',
  border: '1px solid var(--oak-warm)',
  borderRadius: 2,
  boxShadow: 'inset 0 1px 3px rgba(31,24,16,0.07)',
  padding: '12px 14px',
  fontSize: '0.95rem',
  width: '100%',
  outline: 'none',
};

const errorInputStyle: React.CSSProperties = {
  ...inputBaseStyle,
  border: `1px solid ${errorRed}`,
};

function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="label-caps mb-1.5 flex items-baseline gap-2"
      style={{ color: 'var(--ink-soft)', fontSize: '0.62rem' }}
    >
      <span>{children}</span>
      {optional ? (
        <span
          className="font-lora"
          style={{
            fontSize: '0.65rem',
            color: 'var(--ink-soft)',
            opacity: 0.6,
            letterSpacing: 0,
            textTransform: 'none',
          }}
        >
          ({optional})
        </span>
      ) : null}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="mt-1.5 font-lora"
      style={{ fontSize: '0.78rem', color: errorRed }}
      role="alert"
    >
      {message}
    </p>
  );
}

export default function ContactForm({ copy, locale }: ContactFormProps) {
  const prefersReduced = useReducedMotion();
  const mountedAtRef = useRef<number>(0);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [successName, setSuccessName] = useState<string>('');

  // Mount timestamp for the timing-check defense layer.
  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: undefined as unknown as ContactSubject,
      message: '',
      website: '',
      locale,
    },
    mode: 'onTouched',
  });

  const message = watch('message') ?? '';
  const messageCount = message.length;

  const onSubmit = handleSubmit(async (values) => {
    setStatus('loading');
    setServerError(null);

    const elapsedMs = mountedAtRef.current
      ? Date.now() - mountedAtRef.current
      : undefined;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          phone: values.phone || undefined,
          elapsedMs,
          locale,
        }),
      });

      if (res.status === 429) {
        const data = (await res.json().catch(() => ({}))) as {
          retryAfter?: number;
        };
        const minutes = Math.max(1, Math.round((data.retryAfter ?? 60) / 60));
        const template =
          minutes === 1
            ? copy.submit.errorRateTemplate.one
            : copy.submit.errorRateTemplate.many;
        setStatus('error');
        setServerError(template.replace('{minutes}', String(minutes)));
        return;
      }

      if (!res.ok) {
        setStatus('error');
        setServerError(copy.submit.errorGeneric);
        return;
      }

      setSuccessName(values.name);
      setStatus('success');
      reset();
    } catch {
      setStatus('error');
      setServerError(copy.submit.errorGeneric);
    }
  });

  if (status === 'success') {
    return (
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
        style={{
          backgroundColor: 'var(--cream-warm)',
          border: '1px solid rgba(139,94,60,0.3)',
          borderRadius: 6,
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        <svg
          width="56"
          height="32"
          viewBox="0 0 56 32"
          fill="none"
          aria-hidden
          style={{ margin: '0 auto 18px', display: 'block' }}
        >
          <path
            d="M 2 22 C 12 16, 22 24, 28 18 C 34 12, 44 22, 54 16"
            stroke="rgba(139,94,60,0.55)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="28" cy="18" r="2.5" fill="rgba(184,115,51,0.7)" />
        </svg>
        <p
          className="font-caudex"
          style={{
            fontSize: '1.35rem',
            color: 'var(--oak-deep)',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: 10,
          }}
        >
          {copy.submit.successHeadlineTemplate.replace('{name}', successName)}
        </p>
        <p
          className="font-lora"
          style={{
            fontSize: '0.96rem',
            color: 'var(--ink-soft)',
            lineHeight: 1.65,
            maxWidth: 420,
            margin: '0 auto',
          }}
        >
          {copy.submit.successBody}
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative"
      style={{
        backgroundColor: 'var(--cream-warm)',
        border: '1px solid rgba(139,94,60,0.25)',
        borderRadius: 6,
        padding: 'clamp(24px, 4vw, 36px)',
      }}
      aria-label={copy.sectionLabel}
    >
      <div className="paper-texture absolute inset-0 pointer-events-none rounded-[6px]" aria-hidden />

      <div className="relative flex flex-col gap-5">
        <p
          className="label-caps"
          style={{ color: 'var(--copper)', fontSize: '0.62rem' }}
        >
          {copy.sectionLabel}
        </p>

        {/* Honeypot — visually hidden + aria-hidden + tabIndex -1. Real
            users cannot focus it; bots filling all fields will. */}
        <div
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 'auto',
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
          aria-hidden
        >
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register('website')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="contact-name">{copy.fields.name.label}</FieldLabel>
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              placeholder={copy.fields.name.placeholder}
              style={errors.name ? errorInputStyle : inputBaseStyle}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <FieldLabel htmlFor="contact-email">{copy.fields.email.label}</FieldLabel>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder={copy.fields.email.placeholder}
              style={errors.email ? errorInputStyle : inputBaseStyle}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel
              htmlFor="contact-phone"
              optional={copy.fields.phone.optional}
            >
              {copy.fields.phone.label}
            </FieldLabel>
            <input
              id="contact-phone"
              type="tel"
              autoComplete="tel"
              placeholder={copy.fields.phone.placeholder}
              style={errors.phone ? errorInputStyle : inputBaseStyle}
              {...register('phone')}
            />
            <FieldError message={errors.phone?.message} />
          </div>

          <div>
            <FieldLabel htmlFor="contact-subject">
              {copy.fields.subject.label}
            </FieldLabel>
            <select
              id="contact-subject"
              defaultValue=""
              style={errors.subject ? errorInputStyle : inputBaseStyle}
              {...register('subject')}
            >
              <option value="" disabled>
                {copy.fields.subject.placeholder}
              </option>
              {CONTACT_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {SUBJECT_LABELS[locale][s]}
                </option>
              ))}
            </select>
            <FieldError message={errors.subject?.message} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <FieldLabel htmlFor="contact-message">
              {copy.fields.message.label}
            </FieldLabel>
            <span
              className="font-lora"
              style={{
                fontSize: '0.72rem',
                color: messageCount > 2000 ? errorRed : 'var(--ink-soft)',
                opacity: 0.7,
              }}
              aria-live="polite"
            >
              {messageCount}/2000 {copy.fields.message.counter}
            </span>
          </div>
          <textarea
            id="contact-message"
            rows={7}
            placeholder={copy.fields.message.placeholder}
            style={{
              ...(errors.message ? errorInputStyle : inputBaseStyle),
              resize: 'vertical',
              minHeight: 160,
              fontFamily: 'var(--font-lora)',
              lineHeight: 1.6,
            }}
            {...register('message')}
          />
          <FieldError message={errors.message?.message} />
        </div>

        {serverError && status === 'error' ? (
          <p
            className="font-lora"
            style={{
              fontSize: '0.85rem',
              color: errorRed,
              backgroundColor: 'rgba(159,45,32,0.08)',
              border: `1px solid ${errorRed}55`,
              borderRadius: 4,
              padding: '10px 12px',
            }}
            role="alert"
          >
            {serverError}
          </p>
        ) : null}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{
              backgroundColor: 'var(--oak-warm)',
              color: 'var(--cream-warm)',
              borderRadius: 6,
              fontFamily: 'var(--font-caudex)',
              letterSpacing: '0.04em',
              padding: '12px 28px',
              fontSize: '0.95rem',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 4px rgba(31,24,16,0.18)',
              minWidth: 200,
            }}
          >
            {status === 'loading' ? copy.submit.loading : copy.submit.idle}
          </button>
        </div>
      </div>
    </form>
  );
}
