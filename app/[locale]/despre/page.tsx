import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ABOUT_CONTENT } from '@/components/about/content';
import AboutContent from '@/components/about/AboutContent';
import { isLocale, localizedPath, type Locale } from '@/lib/i18n-routes';

// Canonical site URL — domain target per CLAUDE.md §14. Until the domain is
// connected, Next.js still emits absolute hreflang/canonical URLs against
// this base; OG images resolve to the same base. Vercel preview URLs won't
// inherit; that's fine for the visible-product /despre page.
const SITE_URL = 'https://oakfantasy.ro';

// Shared with the homepage for now; per-locale /despre OG image is a future
// content task (no /despre-specific image exists yet).
// TODO: replace with a dedicated workshop OG image (1200x630) when available.
const OG_IMAGE = '/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg';

const ALTERNATES_LANGS = {
  ro: '/ro/despre',
  en: '/en/about',
  'x-default': '/ro/despre',
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
  const c = ABOUT_CONTENT[locale];
  const path = localizedPath('despre', locale);
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
      siteName: 'Oak Fantasy',
      locale: ogLocale,
      type: 'website',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Oak Fantasy' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: c.meta.title,
      description: c.meta.description,
      images: [OG_IMAGE],
    },
  };
}

// JSON-LD safe-encode: prevent any "</script>" sequence in stringified data
// from terminating the script tag prematurely.
function ldSafe(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function buildJsonLd(locale: Locale) {
  const c = ABOUT_CONTENT[locale];
  const path = localizedPath('despre', locale);
  const home = `/${locale}`;

  const aboutPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: c.meta.title,
    description: c.meta.description,
    url: `${SITE_URL}${path}`,
    inLanguage: locale === 'en' ? 'en' : 'ro',
    mainEntity: {
      '@type': 'Organization',
      name: 'Oak Fantasy',
      url: SITE_URL,
      logo: `${SITE_URL}/3D_Cutting_Board_Model_Design.svg`,
      description:
        locale === 'en'
          ? 'A small Romanian workshop hand-crafting oak cutting boards from Carpathian oak.'
          : 'Atelier românesc mic care lucrează manual tocătoare din stejar din Carpați.',
      foundingDate: '2026',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'RO',
        addressRegion: 'Transilvania',
      },
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'en' ? 'Home' : 'Acasă',
        item: `${SITE_URL}${home}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale === 'en' ? 'About' : 'Despre',
        item: `${SITE_URL}${path}`,
      },
    ],
  };

  return [aboutPage, breadcrumb];
}

export default function DesprePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const ldList = buildJsonLd(locale);

  return (
    <>
      {ldList.map((ld, i) => (
        <script
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldSafe(ld) }}
        />
      ))}
      <AboutContent locale={locale} />
    </>
  );
}
