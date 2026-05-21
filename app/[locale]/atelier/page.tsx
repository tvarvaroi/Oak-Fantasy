import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ATELIER_CONTENT } from '@/components/atelier/content';
import AtelierContent from '@/components/atelier/AtelierContent';
import { isLocale, localizedPath, type Locale } from '@/lib/i18n-routes';

const SITE_URL = 'https://oakfantasy.ro';

// Shared OG image with /despre until a dedicated atelier OG (workshop photo
// 1200x630) is delivered.
// TODO: replace with a workshop-specific OG image when the founder supplies one.
const OG_IMAGE = '/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg';

const ALTERNATES_LANGS = {
  ro: '/ro/atelier',
  en: '/en/workshop',
  'x-default': '/ro/atelier',
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
  const c = ATELIER_CONTENT[locale];
  const path = localizedPath('atelier', locale);
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

function ldSafe(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function buildJsonLd(locale: Locale) {
  const c = ATELIER_CONTENT[locale];
  const path = localizedPath('atelier', locale);
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
        name: c.nav.link,
        item: `${SITE_URL}${path}`,
      },
    ],
  };

  // Bonus: ItemList of the 6 tools — rich-result candidate for Google.
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name:
      locale === 'en'
        ? 'Oak Fantasy workshop tools'
        : 'Uneltele atelierului Oak Fantasy',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: c.tools.items.length,
    itemListElement: c.tools.items.map((tool, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: tool.name,
      description: tool.desc,
    })),
  };

  return [aboutPage, breadcrumb, itemList];
}

export default function AtelierPage({
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
      <AtelierContent locale={locale} />
    </>
  );
}
