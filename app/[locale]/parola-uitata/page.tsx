import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import AuthShell from '@/components/auth/AuthShell';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { AUTH_CONTENT } from '@/components/auth/content';
import { isLocale, type Locale } from '@/lib/i18n-routes';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const c = AUTH_CONTENT[params.locale].forgot;
  return { title: c.meta.title, description: c.meta.description, robots: { index: false } };
}

export function generateStaticParams() {
  return [{ locale: 'ro' as const }, { locale: 'en' as const }];
}

export default function Page({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const c = AUTH_CONTENT[locale];
  return (
    <AuthShell routeKey="forgotPassword" locale={locale} eyebrow={c.forgot.eyebrow} title={c.forgot.title} subtitle={c.forgot.subtitle}>
      <ForgotPasswordForm copy={c.forgot} locale={locale} />
    </AuthShell>
  );
}
