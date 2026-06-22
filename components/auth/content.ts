import type { Locale } from '@/lib/i18n-routes';

// Bilingual copy for the 4 auth pages. All strings (no functions) so the map
// can cross the server->client boundary (gotcha 2026-06-16). Key parity
// between ro/en is enforced by scripts/check-i18n.mjs.

export interface AuthPageCopy {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface AuthContent {
  login: AuthPageCopy & {
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submit: string;
    submitting: string;
    forgotLink: string;
    noAccount: string;
    registerLink: string;
  };
  register: AuthPageCopy & {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phoneOptional: string;
    phonePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmLabel: string;
    confirmPlaceholder: string;
    submit: string;
    submitting: string;
    haveAccount: string;
    loginLink: string;
  };
  forgot: AuthPageCopy & {
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    submitting: string;
    backToLogin: string;
    successTitle: string;
    successBody: string;
  };
  reset: AuthPageCopy & {
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmLabel: string;
    confirmPlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    goToLogin: string;
    invalidLink: string;
  };
  // Shared server-error strings (anti-enumeration on login).
  errors: {
    invalidCredentials: string;
    emailExists: string;
    generic: string;
    weakPassword: string;
  };
}

export const AUTH_CONTENT: Record<Locale, AuthContent> = {
  ro: {
    login: {
      meta: { title: 'Conectare — Oak Fantasy', description: 'Conectează-te la contul tău Oak Fantasy.' },
      eyebrow: 'Bine ai revenit',
      title: 'Conectare',
      subtitle: 'Intră în contul tău ca să-ți vezi comenzile și preferințele.',
      emailLabel: 'Email',
      emailPlaceholder: 'adresa ta de email',
      passwordLabel: 'Parolă',
      passwordPlaceholder: 'parola ta',
      submit: 'Conectează-te',
      submitting: 'Se conectează…',
      forgotLink: 'Ai uitat parola?',
      noAccount: 'Nu ai cont?',
      registerLink: 'Înregistrează-te',
    },
    register: {
      meta: { title: 'Înregistrare — Oak Fantasy', description: 'Creează-ți cont Oak Fantasy.' },
      eyebrow: 'Bun venit',
      title: 'Creează-ți cont',
      subtitle: 'Un cont îți păstrează comenzile și adresele la îndemână.',
      nameLabel: 'Nume complet',
      namePlaceholder: 'cum ne adresăm',
      emailLabel: 'Email',
      emailPlaceholder: 'adresa ta de email',
      phoneLabel: 'Telefon',
      phoneOptional: 'opțional',
      phonePlaceholder: 'pentru detalii rapide despre comenzi',
      passwordLabel: 'Parolă',
      passwordPlaceholder: 'minim 6 caractere',
      confirmLabel: 'Confirmă parola',
      confirmPlaceholder: 'repetă parola',
      submit: 'Creează cont',
      submitting: 'Se creează…',
      haveAccount: 'Ai deja cont?',
      loginLink: 'Conectează-te',
    },
    forgot: {
      meta: { title: 'Recuperare parolă — Oak Fantasy', description: 'Resetează-ți parola Oak Fantasy.' },
      eyebrow: 'Recuperare',
      title: 'Ai uitat parola?',
      subtitle: 'Îți trimitem un link de resetare pe email.',
      emailLabel: 'Email',
      emailPlaceholder: 'adresa ta de email',
      submit: 'Trimite link de resetare',
      submitting: 'Se trimite…',
      backToLogin: 'Înapoi la conectare',
      successTitle: 'Verifică-ți email-ul',
      successBody: 'Dacă există un cont cu această adresă, vei primi un link de resetare a parolei în câteva minute.',
    },
    reset: {
      meta: { title: 'Parolă nouă — Oak Fantasy', description: 'Setează o parolă nouă.' },
      eyebrow: 'Parolă nouă',
      title: 'Setează o parolă nouă',
      subtitle: 'Alege o parolă pe care nu ai mai folosit-o.',
      passwordLabel: 'Parolă nouă',
      passwordPlaceholder: 'minim 6 caractere',
      confirmLabel: 'Confirmă parola',
      confirmPlaceholder: 'repetă parola',
      submit: 'Salvează parola',
      submitting: 'Se salvează…',
      successTitle: 'Parolă schimbată',
      successBody: 'Parola ta a fost actualizată. Te poți conecta acum.',
      goToLogin: 'Mergi la conectare',
      invalidLink: 'Link-ul de resetare este invalid sau a expirat. Cere unul nou.',
    },
    errors: {
      invalidCredentials: 'Email sau parolă greșite.',
      emailExists: 'Există deja un cont cu acest email.',
      generic: 'A apărut o eroare. Te rugăm să încerci din nou.',
      weakPassword: 'Parola trebuie să aibă cel puțin 6 caractere.',
    },
  },
  en: {
    login: {
      meta: { title: 'Sign in — Oak Fantasy', description: 'Sign in to your Oak Fantasy account.' },
      eyebrow: 'Welcome back',
      title: 'Sign in',
      subtitle: 'Sign in to see your orders and preferences.',
      emailLabel: 'Email',
      emailPlaceholder: 'your email address',
      passwordLabel: 'Password',
      passwordPlaceholder: 'your password',
      submit: 'Sign in',
      submitting: 'Signing in…',
      forgotLink: 'Forgot your password?',
      noAccount: "Don't have an account?",
      registerLink: 'Create one',
    },
    register: {
      meta: { title: 'Create account — Oak Fantasy', description: 'Create your Oak Fantasy account.' },
      eyebrow: 'Welcome',
      title: 'Create your account',
      subtitle: 'An account keeps your orders and addresses at hand.',
      nameLabel: 'Full name',
      namePlaceholder: 'how should we address you',
      emailLabel: 'Email',
      emailPlaceholder: 'your email address',
      phoneLabel: 'Phone',
      phoneOptional: 'optional',
      phonePlaceholder: 'for quick order updates',
      passwordLabel: 'Password',
      passwordPlaceholder: 'at least 6 characters',
      confirmLabel: 'Confirm password',
      confirmPlaceholder: 'repeat your password',
      submit: 'Create account',
      submitting: 'Creating…',
      haveAccount: 'Already have an account?',
      loginLink: 'Sign in',
    },
    forgot: {
      meta: { title: 'Reset password — Oak Fantasy', description: 'Reset your Oak Fantasy password.' },
      eyebrow: 'Recovery',
      title: 'Forgot your password?',
      subtitle: "We'll email you a reset link.",
      emailLabel: 'Email',
      emailPlaceholder: 'your email address',
      submit: 'Send reset link',
      submitting: 'Sending…',
      backToLogin: 'Back to sign in',
      successTitle: 'Check your email',
      successBody: 'If an account exists for this address, you will receive a password reset link in a few minutes.',
    },
    reset: {
      meta: { title: 'New password — Oak Fantasy', description: 'Set a new password.' },
      eyebrow: 'New password',
      title: 'Set a new password',
      subtitle: "Choose a password you haven't used before.",
      passwordLabel: 'New password',
      passwordPlaceholder: 'at least 6 characters',
      confirmLabel: 'Confirm password',
      confirmPlaceholder: 'repeat your password',
      submit: 'Save password',
      submitting: 'Saving…',
      successTitle: 'Password changed',
      successBody: 'Your password has been updated. You can sign in now.',
      goToLogin: 'Go to sign in',
      invalidLink: 'This reset link is invalid or has expired. Request a new one.',
    },
    errors: {
      invalidCredentials: 'Wrong email or password.',
      emailExists: 'An account with this email already exists.',
      generic: 'Something went wrong. Please try again.',
      weakPassword: 'Password must be at least 6 characters.',
    },
  },
};
