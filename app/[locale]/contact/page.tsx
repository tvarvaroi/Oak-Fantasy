import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ContactPage from '@/components/contact/ContactPage';
import { CONTACT_CONTENT } from '@/components/contact/content';
import { LEGAL_INFO } from '@/lib/legal-info';
import { isLocale, localizedPath, type Locale } from '@/lib/i18n-routes';

// Canonical site URL — mirrors patterns in app/[locale]/despre/page.tsx.
const SITE_URL = `https://${LEGAL_INFO.brandDomain}`;
const OG_IMAGE = '/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg';

const ALTERNATES_LANGS = {
  ro: '/ro/contact',
  en: '/en/contact',
  'x-default': '/ro/contact',
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
  const c = CONTACT_CONTENT[locale];
  const path = localizedPath('contact', locale);
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
  const c = CONTACT_CONTENT[locale];
  const path = localizedPath('contact', locale);

  const contactPage = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: c.meta.title,
    description: c.meta.description,
    inLanguage: locale,
    url: `${SITE_URL}${path}`,
    isPartOf: { '@type': 'WebSite', name: LEGAL_INFO.brandName, url: SITE_URL },
  };

  return contactPage;
}

export default function Page({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const copy = CONTACT_CONTENT[locale];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldSafe(buildJsonLd(locale)) }}
      />
      <ContactPage copy={copy} locale={locale} />
    </>
  );
}
