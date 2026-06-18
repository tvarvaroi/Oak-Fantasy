import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import LegalLayout from '@/components/legal/LegalLayout';
import LegalPlaceholder from '@/components/legal/LegalPlaceholder';
import LegalStatutoryNote from '@/components/legal/LegalStatutoryNote';
import {
  RETURNS_CONTENT,
  RETURNS_STATUTORY,
} from '@/components/legal/returns/content';
import { LEGAL_INFO } from '@/lib/legal-info';
import { isLocale, localizedPath, type Locale } from '@/lib/i18n-routes';

const SITE_URL = `https://${LEGAL_INFO.brandDomain}`;
const OG_IMAGE = '/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg';

const ALTERNATES_LANGS = {
  ro: '/ro/retur',
  en: '/en/returns',
  'x-default': '/ro/retur',
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
  const c = RETURNS_CONTENT[locale];
  const path = localizedPath('returns', locale);
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
  const c = RETURNS_CONTENT[locale];
  const path = localizedPath('returns', locale);
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

  // Statutory note for OUG 34/2014 art. 16 lit. c — injected as a
  // sectionOverride for the `exceptions` section. Section ids are
  // locale-agnostic; only titles localise.
  const note = RETURNS_STATUTORY[locale].exceptions;

  const overrides = {
    exceptions: (
      <>
        <LegalPlaceholder locale={locale} />
        <LegalStatutoryNote
          eyebrow={note.eyebrow}
          citation={note.citation}
          body={note.body}
        />
      </>
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldSafe(buildJsonLd(locale)) }}
      />
      <LegalLayout
        content={RETURNS_CONTENT[locale]}
        locale={locale}
        sectionOverrides={overrides}
      />
    </>
  );
}
