'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { createClient } from '@/lib/supabase-client';
import { loginSchema, type LoginData } from '@/lib/schemas/auth';
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

export default function LoginForm({
  copy,
  errors: errorCopy,
  locale,
}: {
  copy: AuthContent['login'];
  errors: AuthContent['errors'];
  locale: Locale;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      // Anti-enumeration: never reveal whether the email exists.
      setServerError(errorCopy.invalidCredentials);
      return;
    }
    router.push(`/${locale}`);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <FieldLabel htmlFor="login-email">{copy.emailLabel}</FieldLabel>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder={copy.emailPlaceholder}
          style={errors.email ? errorInputStyle : inputBaseStyle}
          {...register('email')}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <FieldLabel htmlFor="login-password">{copy.passwordLabel}</FieldLabel>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder={copy.passwordPlaceholder}
          style={errors.password ? errorInputStyle : inputBaseStyle}
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <ServerError message={serverError} />

      <SubmitButton loading={isSubmitting} label={copy.submit} loadingLabel={copy.submitting} />

      <div className="flex flex-col items-center gap-2 pt-1 text-center">
        <a
          href={localizedPath('forgotPassword', locale)}
          className="font-lora"
          style={{ color: 'var(--oak-warm)', textDecoration: 'underline', fontSize: '0.85rem' }}
        >
          {copy.forgotLink}
        </a>
        <p className="font-lora" style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
          {copy.noAccount}{' '}
          <a
            href={localizedPath('register', locale)}
            style={{ color: 'var(--oak-warm)', textDecoration: 'underline' }}
          >
            {copy.registerLink}
          </a>
        </p>
      </div>
    </form>
  );
}
