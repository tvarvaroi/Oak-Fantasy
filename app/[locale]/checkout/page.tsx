import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isLocale, type Locale } from '@/lib/i18n-routes';
import { getUser } from '@/lib/auth/get-user';
import { CHECKOUT_CONTENT } from '@/components/checkout/content';
import CheckoutContent, { type CheckoutPrefill } from '@/components/checkout/CheckoutContent';

// /checkout — multistep flow (Task 3.3). force-dynamic: reads the session to
// prefill contact details for logged-in users (D7). noindex (transactional).

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  return {
    title: `${CHECKOUT_CONTENT[params.locale].pageTitle} — Oak Fantasy`,
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const user = await getUser();
  const prefill: CheckoutPrefill = user
    ? {
        isLoggedIn: true,
        email: user.email,
        fullName: user.profile?.full_name ?? undefined,
        phone: user.profile?.phone ?? undefined,
      }
    : { isLoggedIn: false };

  return <CheckoutContent locale={locale} prefill={prefill} />;
}
