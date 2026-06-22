'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';

import { createClient } from '@/lib/supabase-client';
import { forgotPasswordSchema, type ForgotPasswordData } from '@/lib/schemas/auth';
import { localizedPath, type Locale } from '@/lib/i18n-routes';

import type { AuthContent } from './content';
import {
  FieldError,
  FieldLabel,
  SubmitButton,
  errorInputStyle,
  inputBaseStyle,
} from './fields';

export default function ForgotPasswordForm({
  copy,
  locale,
}: {
  copy: AuthContent['forgot'];
  locale: Locale;
}) {
  const prefersReduced = useReducedMotion();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    const supabase = createClient();
    // Reset link lands on /auth/callback, which exchanges the code for a
    // session then forwards to the reset-password page.
    const next = localizedPath('resetPassword', locale);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    // Anti-enumeration: ignore the result, always show the same success state.
    await supabase.auth.resetPasswordForEmail(values.email, { redirectTo });
    setSent(true);
  });

  if (sent) {
    return (
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="font-caudex" style={{ fontSize: '1.2rem', color: 'var(--oak-deep)', fontWeight: 700, marginBottom: 10 }}>
          {copy.successTitle}
        </p>
        <p className="font-lora" style={{ fontSize: '0.92rem', color: 'var(--ink-soft)', lineHeight: 1.65 }}>
          {copy.successBody}
        </p>
        <a
          href={localizedPath('login', locale)}
          className="font-lora inline-block mt-5"
          style={{ color: 'var(--oak-warm)', textDecoration: 'underline', fontSize: '0.88rem' }}
        >
          {copy.backToLogin}
        </a>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <FieldLabel htmlFor="forgot-email">{copy.emailLabel}</FieldLabel>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder={copy.emailPlaceholder}
          style={errors.email ? errorInputStyle : inputBaseStyle}
          {...register('email')}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <SubmitButton loading={isSubmitting} label={copy.submit} loadingLabel={copy.submitting} />

      <a
        href={localizedPath('login', locale)}
        className="font-lora text-center"
        style={{ color: 'var(--oak-warm)', textDecoration: 'underline', fontSize: '0.85rem' }}
      >
        {copy.backToLogin}
      </a>
    </form>
  );
}
