import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import LegalLayout from '@/components/legal/LegalLayout';
import LegalShell from '@/components/legal/LegalShell';
import { TERMS_CONTENT } from '@/components/legal/terms/content';
import { LEGAL_INFO } from '@/lib/legal-info';
import { isLocale, localizedPath, type Locale } from '@/lib/i18n-routes';

const SITE_URL = `https://${LEGAL_INFO.brandDomain}`;
const OG_IMAGE = '/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg';

const ALTERNATES_LANGS = {
  ro: '/ro/termeni',
  en: '/en/terms',
  'x-default': '/ro/termeni',
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
  const c = TERMS_CONTENT[locale];
  const path = localizedPath('terms', locale);
  const ogLocale = locale === 'en' ? 'en_US' : 'ro_RO';

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
      locale: ogLocale,
      type: 'website',
      images: [
        { url: OG_IMAGE, width: 1200, height: 630, alt: LEGAL_INFO.brandName },
      ],
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
  const c = TERMS_CONTENT[locale];
  const path = localizedPath('terms', locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: c.meta.title,
    description: c.meta.description,
    inLanguage: locale,
    url: `${SITE_URL}${path}`,
    isPartOf: {
      '@type': 'WebSite',
      name: LEGAL_INFO.brandName,
      url: SITE_URL,
    },
  };
}

export default function Page({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldSafe(buildJsonLd(locale)) }}
      />
      <LegalShell routeKey="terms" locale={locale}>
        <LegalLayout content={TERMS_CONTENT[locale]} locale={locale} />
      </LegalShell>
    </>
  );
}
