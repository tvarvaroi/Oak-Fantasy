import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import AuthShell from '@/components/auth/AuthShell';
import LoginForm from '@/components/auth/LoginForm';
import { AUTH_CONTENT } from '@/components/auth/content';
import { getUser } from '@/lib/auth/get-user';
import { isLocale, type Locale } from '@/lib/i18n-routes';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const c = AUTH_CONTENT[params.locale].login;
  return { title: c.meta.title, description: c.meta.description, robots: { index: false } };
}

export default async function Page({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  // Redirect-away: an already authenticated user has no business here.
  const user = await getUser();
  if (user) redirect(`/${locale}`);

  const c = AUTH_CONTENT[locale];
  return (
    <AuthShell routeKey="login" locale={locale} eyebrow={c.login.eyebrow} title={c.login.title} subtitle={c.login.subtitle}>
      <LoginForm copy={c.login} errors={c.errors} locale={locale} />
    </AuthShell>
  );
}
