'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { createClient } from '@/lib/supabase-client';
import { loginSchema, type LoginData } from '@/lib/schemas/auth';
import {
  FieldError,
  FieldLabel,
  ServerError,
  SubmitButton,
  errorInputStyle,
  inputBaseStyle,
} from '@/components/auth/fields';

// Admin login. Distinct from the customer login (Layer 4 — isolated entry).
// After a successful password sign-in, verifies role === 'admin'; a non-admin
// (e.g. a customer who knows this URL) is signed back out with an access-denied
// message so no customer session is left dangling on the admin surface.
export default function AdminLoginForm() {
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error || !data.user) {
      setServerError('Email sau parolă greșite.');
      return;
    }

    // Role check — only admins may proceed.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setServerError('Acces interzis. Acest cont nu are drepturi de administrator.');
      return;
    }

    router.push('/admin');
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <FieldLabel htmlFor="admin-email">Email</FieldLabel>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          placeholder="adresa de administrator"
          style={errors.email ? errorInputStyle : inputBaseStyle}
          {...register('email')}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <FieldLabel htmlFor="admin-password">Parolă</FieldLabel>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          placeholder="parola"
          style={errors.password ? errorInputStyle : inputBaseStyle}
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <ServerError message={serverError} />

      <SubmitButton loading={isSubmitting} label="Intră în panou" loadingLabel="Se conectează…" />
    </form>
  );
}
