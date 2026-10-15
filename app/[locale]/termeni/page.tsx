import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OG_IMAGE_DEFAULT as OG_IMAGE } from '@/lib/seo';

import LegalLayout from '@/components/legal/LegalLayout';
import LegalPlaceholder from '@/components/legal/LegalPlaceholder';
import LegalShell from '@/components/legal/LegalShell';
import { TERMS_CONTENT } from '@/components/legal/terms/content';
import { LEGAL_INFO } from '@/lib/legal-info';
import { isLocale, localizedPath, type Locale } from '@/lib/i18n-routes';

const SITE_URL = `https://${LEGAL_INFO.brandDomain}`;

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

// Final, founder-confirmed facts (2026-07-11) injected as section overrides
// while the full lawyer copy is still pending. Same pattern as /retur's
// statutory note: definitive sentence + the shared "in preparation" body.
const TERMS_FINAL_FACTS = {
  ro: {
    delivery: 'Livrăm exclusiv pe teritoriul României.',
    pricesVat:
      'Toate prețurile afișate pe site sunt exprimate în RON și sunt finale. Societatea nu este plătitoare de TVA.',
    // 2026-10-15 founder decision: cash on delivery is the only payment method.
    payment:
      'Plata se face exclusiv ramburs, în numerar, la livrare, direct curierului. Momentan nu acceptăm plata online cu cardul.',
  },
  en: {
    delivery: 'We deliver exclusively within the territory of Romania.',
    pricesVat:
      'All prices on the site are expressed in RON and are final. The company is not registered for VAT.',
    payment:
      'Payment is made exclusively by cash on delivery, in cash, directly to the courier. We do not currently accept online card payments.',
  },
} as const;

function FinalFact({ text }: { text: string }) {
  return (
    <p
      className="font-lora"
      style={{
        margin: '0 0 14px',
        padding: '10px 14px',
        fontSize: '0.95rem',
        lineHeight: 1.7,
        color: 'var(--ink)',
        borderLeft: '2px solid var(--oak-warm)',
        backgroundColor: 'rgba(139,94,60,0.06)',
        borderRadius: '0 6px 6px 0',
      }}
    >
      {text}
    </p>
  );
}

export default function Page({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const facts = TERMS_FINAL_FACTS[locale];

  const overrides = {
    delivery: (
      <>
        <FinalFact text={facts.delivery} />
        <LegalPlaceholder locale={locale} />
      </>
    ),
    'prices-payment': (
      <>
        <FinalFact text={facts.pricesVat} />
        <FinalFact text={facts.payment} />
        <LegalPlaceholder locale={locale} />
      </>
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldSafe(buildJsonLd(locale)) }}
      />
      <LegalShell routeKey="terms" locale={locale}>
        <LegalLayout
          content={TERMS_CONTENT[locale]}
          locale={locale}
          sectionOverrides={overrides}
        />
      </LegalShell>
    </>
  );
}
