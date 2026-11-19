import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import CustomOrderContent from '@/components/la-comanda/CustomOrderContent';
import { CUSTOM_ORDER_CONTENT } from '@/components/la-comanda/content';
import { LEGAL_INFO } from '@/lib/legal-info';
import { isLocale, localizedPath, type Locale } from '@/lib/i18n-routes';
import { OG_IMAGE_DEFAULT as OG_IMAGE } from '@/lib/seo';
import { SITE_URL } from '@/lib/site-url';

// /ro/la-comanda · /en/custom-orders (2026-11-18). Server component: metadata
// + JSON-LD; the page body is the client wrapper (Navbar + sections + Footer).


const ALTERNATES_LANGS = {
  ro: '/ro/la-comanda',
  en: '/en/custom-orders',
  'x-default': '/ro/la-comanda',
} as const;

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
  const c = CUSTOM_ORDER_CONTENT[locale];
  const path = localizedPath('laComanda', locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: c.meta.title,
    description: c.meta.description,
    alternates: {
      canonical: path,
      languages: ALTERNATES_LANGS,
    },
    openGraph: {
      title: c.meta.title,
      description: c.meta.description,
      url: path,
      siteName: LEGAL_INFO.brandName,
      locale: locale === 'en' ? 'en_US' : 'ro_RO',
      type: 'website',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: LEGAL_INFO.brandName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: c.meta.title,
      description: c.meta.description,
      images: [OG_IMAGE],
    },
  };
}

function ldSafe(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function buildJsonLd(locale: Locale) {
  const c = CUSTOM_ORDER_CONTENT[locale];
  const url = `${SITE_URL}${localizedPath('laComanda', locale)}`;
  const organization = { '@id': `${SITE_URL}/#organization` };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: c.meta.title,
    description: c.meta.description,
    url,
    inLanguage: locale,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: organization,
    publisher: organization,
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'en' ? 'Home' : 'Acasă',
        item: `${SITE_URL}/${locale}`,
      },
      { '@type': 'ListItem', position: 2, name: c.navLabel, item: url },
    ],
  };

  // The service itself — no Offer/price on purpose (every piece is quoted
  // individually after the WhatsApp conversation).
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: c.meta.title.split(' — ')[0],
    serviceType: locale === 'en' ? 'Custom woodwork' : 'Lucrări din lemn la comandă',
    description: c.meta.description,
    url,
    provider: organization,
    areaServed: { '@type': 'Country', name: locale === 'en' ? 'Romania' : 'România' },
  };

  return [webPage, breadcrumb, service];
}

export default function LaComandaPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  return (
    <>
      {buildJsonLd(locale).map((ld, i) => (
        <script
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldSafe(ld) }}
        />
      ))}
      <CustomOrderContent locale={locale} />
    </>
  );
}
