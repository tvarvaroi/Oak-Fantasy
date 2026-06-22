'use client';

// Shared form primitives for the auth forms — consistent with ContactForm
// (full box-border inputs, label-caps labels, error styling).

import React from 'react';

export const errorRed = '#9F2D20';

export const inputBaseStyle: React.CSSProperties = {
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

export const errorInputStyle: React.CSSProperties = {
  ...inputBaseStyle,
  border: `1px solid ${errorRed}`,
};

export function FieldLabel({
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

export function FieldError({ message }: { message?: string }) {
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

export function ServerError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
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
      {message}
    </p>
  );
}

export function SubmitButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 w-full"
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
      }}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

// Inline text link styled for the auth footers ("Forgot password?", etc.)
export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="font-lora"
      style={{
        color: 'var(--oak-warm)',
        textDecoration: 'underline',
        fontSize: '0.88rem',
      }}
    >
      {children}
    </a>
  );
}
