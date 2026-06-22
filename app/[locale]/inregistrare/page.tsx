import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import AuthShell from '@/components/auth/AuthShell';
import RegisterForm from '@/components/auth/RegisterForm';
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
  const c = AUTH_CONTENT[params.locale].register;
  return { title: c.meta.title, description: c.meta.description, robots: { index: false } };
}

export default async function Page({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const user = await getUser();
  if (user) redirect(`/${locale}`);

  const c = AUTH_CONTENT[locale];
  return (
    <AuthShell routeKey="register" locale={locale} eyebrow={c.register.eyebrow} title={c.register.title} subtitle={c.register.subtitle}>
      <RegisterForm copy={c.register} errors={c.errors} locale={locale} />
    </AuthShell>
  );
}
