import { z } from 'zod';

// Supabase default minimum password length is 6.
const PASSWORD_MIN = 6;

export const loginSchema = z.object({
  email: z.string().trim().email('Adresa de email nu este validă.'),
  password: z.string().min(1, 'Introdu parola.'),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Numele este obligatoriu (min 2 caractere).'),
    email: z.string().trim().email('Adresa de email nu este validă.'),
    phone: z.string().trim().max(40, 'Numărul de telefon este prea lung.').optional().or(z.literal('')),
    password: z
      .string()
      .min(PASSWORD_MIN, `Parola trebuie să aibă cel puțin ${PASSWORD_MIN} caractere.`),
    confirmPassword: z.string().min(1, 'Confirmă parola.'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Parolele nu coincid.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Adresa de email nu este validă.'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN, `Parola trebuie să aibă cel puțin ${PASSWORD_MIN} caractere.`),
    confirmPassword: z.string().min(1, 'Confirmă parola.'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Parolele nu coincid.',
    path: ['confirmPassword'],
  });

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
