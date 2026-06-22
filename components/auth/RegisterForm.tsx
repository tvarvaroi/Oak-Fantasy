'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { createClient } from '@/lib/supabase-client';
import { registerSchema, type RegisterData } from '@/lib/schemas/auth';
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

export default function RegisterForm({
  copy,
  errors: errorCopy,
  locale,
}: {
  copy: AuthContent['register'];
  errors: AuthContent['errors'];
  locale: Locale;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      // Stash full_name in metadata too (belt-and-suspenders; the profile
      // row is also updated below per D3).
      options: { data: { full_name: values.fullName } },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already') || msg.includes('registered')) {
        setServerError(errorCopy.emailExists);
      } else if (msg.includes('password')) {
        setServerError(errorCopy.weakPassword);
      } else {
        setServerError(errorCopy.generic);
      }
      return;
    }

    // Confirm-email is OFF, so signUp returns an active session — the client
    // is now authenticated. Persist full_name + phone onto the profile row
    // (RLS allows a user to update their own; guard_profile_role only blocks
    // role changes). Non-fatal if it fails — account already exists.
    if (data.user) {
      await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          phone: values.phone ? values.phone : null,
        })
        .eq('id', data.user.id);
    }

    router.push(`/${locale}`);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <FieldLabel htmlFor="reg-name">{copy.nameLabel}</FieldLabel>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          placeholder={copy.namePlaceholder}
          style={errors.fullName ? errorInputStyle : inputBaseStyle}
          {...register('fullName')}
        />
        <FieldError message={errors.fullName?.message} />
      </div>

      <div>
        <FieldLabel htmlFor="reg-email">{copy.emailLabel}</FieldLabel>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder={copy.emailPlaceholder}
          style={errors.email ? errorInputStyle : inputBaseStyle}
          {...register('email')}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <FieldLabel htmlFor="reg-phone" optional={copy.phoneOptional}>
          {copy.phoneLabel}
        </FieldLabel>
        <input
          id="reg-phone"
          type="tel"
          autoComplete="tel"
          placeholder={copy.phonePlaceholder}
          style={errors.phone ? errorInputStyle : inputBaseStyle}
          {...register('phone')}
        />
        <FieldError message={errors.phone?.message} />
      </div>

      <div>
        <FieldLabel htmlFor="reg-password">{copy.passwordLabel}</FieldLabel>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          placeholder={copy.passwordPlaceholder}
          style={errors.password ? errorInputStyle : inputBaseStyle}
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div>
        <FieldLabel htmlFor="reg-confirm">{copy.confirmLabel}</FieldLabel>
        <input
          id="reg-confirm"
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

      <p className="font-lora pt-1 text-center" style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
        {copy.haveAccount}{' '}
        <a
          href={localizedPath('login', locale)}
          style={{ color: 'var(--oak-warm)', textDecoration: 'underline' }}
        >
          {copy.loginLink}
        </a>
      </p>
    </form>
  );
}
