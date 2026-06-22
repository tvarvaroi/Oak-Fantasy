'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';

import { createClient } from '@/lib/supabase-client';
import { resetPasswordSchema, type ResetPasswordData } from '@/lib/schemas/auth';
import { localizedPath, type Locale } from '@/lib/i18n-routes';

import type { AuthContent } from './content';
import {
  FieldError,
  FieldLabel,
  ServerError,
  SubmitButton,
  errorInputStyle,
  inputBaseStyle,
} from './fields';

export default function ResetPasswordForm({
  copy,
  errors: errorCopy,
  locale,
}: {
  copy: AuthContent['reset'];
  errors: AuthContent['errors'];
  locale: Locale;
}) {
  const prefersReduced = useReducedMotion();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // The /auth/callback handler establishes a recovery session before
  // forwarding here. If there's no session, the link was invalid/expired.
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      const msg = error.message.toLowerCase();
      setServerError(msg.includes('password') ? errorCopy.weakPassword : errorCopy.generic);
      return;
    }
    setDone(true);
  });

  if (done) {
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
          {copy.goToLogin}
        </a>
      </motion.div>
    );
  }

  // No recovery session — invalid or expired link.
  if (hasSession === false) {
    return (
      <div className="text-center">
        <p className="font-lora" style={{ fontSize: '0.92rem', color: 'var(--ink-soft)', lineHeight: 1.65 }}>
          {copy.invalidLink}
        </p>
        <a
          href={localizedPath('forgotPassword', locale)}
          className="font-lora inline-block mt-5"
          style={{ color: 'var(--oak-warm)', textDecoration: 'underline', fontSize: '0.88rem' }}
        >
          {copy.title}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <FieldLabel htmlFor="reset-password">{copy.passwordLabel}</FieldLabel>
        <input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          placeholder={copy.passwordPlaceholder}
          style={errors.password ? errorInputStyle : inputBaseStyle}
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div>
        <FieldLabel htmlFor="reset-confirm">{copy.confirmLabel}</FieldLabel>
        <input
          id="reset-confirm"
          type="password"
          autoComplete="new-password"
          placeholder={copy.confirmPlaceholder}
          style={errors.confirmPassword ? errorInputStyle : inputBaseStyle}
          {...register('confirmPassword')}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <ServerError message={serverError} />

      <SubmitButton loading={isSubmitting} label={copy.submit} loadingLabel={copy.submitting} />
    </form>
  );
}
