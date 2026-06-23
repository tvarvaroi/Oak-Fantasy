'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { createClient } from '@/lib/supabase-client';
import { changePasswordSchema, type ChangePasswordData } from '@/lib/schemas/auth';
import {
  FieldError,
  FieldLabel,
  ServerError,
  SubmitButton,
  errorInputStyle,
  inputBaseStyle,
} from '@/components/auth/fields';

// Admin password change. D1: re-verify the current password via
// signInWithPassword (updateUser alone never checks the old password), then
// updateUser the new one. signInWithPassword on the same user refreshes the
// session, so the admin stays logged in (D3).
export default function ChangePasswordForm({ email }: { email: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSuccess(false);
    const supabase = createClient();

    // 1. Re-verify current password.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email,
      password: values.currentPassword,
    });
    if (reauthError) {
      setServerError('Parola curentă e greșită.');
      return;
    }

    // 2. Set the new password.
    const { error: updateError } = await supabase.auth.updateUser({ password: values.newPassword });
    if (updateError) {
      const m = updateError.message.toLowerCase();
      setServerError(
        m.includes('password')
          ? 'Parola nouă nu este acceptată. Alege una mai puternică.'
          : 'Nu am putut schimba parola. Încearcă din nou.',
      );
      return;
    }

    setSuccess(true);
    reset();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5" style={{ maxWidth: 420 }}>
      {success ? (
        <p
          className="font-lora"
          style={{
            fontSize: '0.88rem',
            color: 'var(--forest-deep)',
            backgroundColor: 'rgba(143,160,104,0.16)',
            border: '1px solid rgba(143,160,104,0.5)',
            borderRadius: 4,
            padding: '10px 12px',
          }}
          role="status"
        >
          Parola a fost schimbată.
        </p>
      ) : null}

      <div>
        <FieldLabel htmlFor="current-password">Parola curentă</FieldLabel>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          style={errors.currentPassword ? errorInputStyle : inputBaseStyle}
          {...register('currentPassword')}
        />
        <FieldError message={errors.currentPassword?.message} />
      </div>

      <div>
        <FieldLabel htmlFor="new-password">Parola nouă</FieldLabel>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          style={errors.newPassword ? errorInputStyle : inputBaseStyle}
          {...register('newPassword')}
        />
        <FieldError message={errors.newPassword?.message} />
      </div>

      <div>
        <FieldLabel htmlFor="confirm-new-password">Confirmă parola nouă</FieldLabel>
        <input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          style={errors.confirmNewPassword ? errorInputStyle : inputBaseStyle}
          {...register('confirmNewPassword')}
        />
        <FieldError message={errors.confirmNewPassword?.message} />
      </div>

      <ServerError message={serverError} />

      <SubmitButton loading={isSubmitting} label="Schimbă parola" loadingLabel="Se schimbă…" />
    </form>
  );
}
