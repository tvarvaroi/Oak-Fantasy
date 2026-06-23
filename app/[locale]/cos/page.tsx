import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isLocale, type Locale } from '@/lib/i18n-routes';
import { CART_CONTENT } from '@/components/cart/content';
import CartPageContent from '@/components/cart/CartPageContent';

// /cos (RO) · /cart (EN). No server data — the cart lives in the client store;
// this is a thin wrapper. noindex: a cart page has no SEO value.

export function generateStaticParams() {
  return [{ locale: 'ro' }, { locale: 'en' }];
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  return {
    title: `${CART_CONTENT[params.locale].title} — Oak Fantasy`,
    robots: { index: false, follow: true },
  };
}

export default function CartPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  return <CartPageContent locale={locale} />;
}
