import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import CustomOrderSent from '@/components/la-comanda/CustomOrderSent';
import { CUSTOM_ORDER_CONTENT } from '@/components/la-comanda/content';
import { isLocale, localizedPath, type Locale } from '@/lib/i18n-routes';
import { SITE_URL } from '@/lib/site-url';

// /ro/la-comanda/sent · /en/custom-orders/sent (2026-11-20). Where the custom
// order form lands after the request was saved, so the visit can be counted
// in Web Analytics without custom events. noindex, not in the sitemap, static:
// it renders no data about the request.

export async function generateStaticParams() {
  return [{ locale: 'ro' as const }, { locale: 'en' as const }];
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale: Locale = params.locale;
  return {
    metadataBase: new URL(SITE_URL),
    title: CUSTOM_ORDER_CONTENT[locale].form.success.metaTitle,
    robots: { index: false, follow: false },
    // Own canonical, no hreflang: without this the page would inherit the
    // homepage canonical + language alternates from the [locale] layout.
    alternates: { canonical: localizedPath('laComandaSent', locale) },
  };
}

export default function CustomOrderSentPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  return <CustomOrderSent locale={params.locale} />;
}
