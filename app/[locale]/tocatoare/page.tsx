import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, localizedPath, type Locale } from '@/lib/i18n-routes';
import { fetchActiveProducts } from '@/lib/db/products';
import { TOCATOARE_CONTENT, formatPriceRon } from '@/components/tocatoare/content';
import TocatoareContent from '@/components/tocatoare/TocatoareContent';

// ISR per D6: catalog rarely changes; activations from Studio reflect within
// ~60s without a redeploy. fetchActiveProducts returns [] gracefully on any
// failure so a Supabase hiccup never crashes prerender (see gotchas.md).
export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: 'ro' }, { locale: 'en' }];
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const c = TOCATOARE_CONTENT[params.locale].meta;
  const canonicalPath = localizedPath('tocatoare', params.locale);
  const otherLocale: Locale = params.locale === 'ro' ? 'en' : 'ro';

  return {
    title: c.title,
    description: c.description,
    metadataBase: new URL('https://oakfantasy.ro'),
    alternates: {
      canonical: canonicalPath,
      languages: {
        ro: localizedPath('tocatoare', 'ro'),
        en: localizedPath('tocatoare', 'en'),
        'x-default': localizedPath('tocatoare', 'ro'),
      },
    },
    openGraph: {
      title: c.ogTitle,
      description: c.ogDescription,
      url: canonicalPath,
      locale: params.locale === 'ro' ? 'ro_RO' : 'en_US',
      alternateLocale: otherLocale === 'ro' ? 'ro_RO' : 'en_US',
      type: 'website',
      images: ['/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: c.ogTitle,
      description: c.ogDescription,
    },
  };
}

// Escape `<` so embedded JSON-LD can't break out of <script>.
function ldSafe(json: unknown): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

interface PageProps {
  params: { locale: string };
}

export default async function TocatoarePage({ params }: PageProps) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const content = TOCATOARE_CONTENT[locale];

  const products = await fetchActiveProducts();

  const origin = 'https://oakfantasy.ro';
  const canonicalUrl = `${origin}${localizedPath('tocatoare', locale)}`;
  const homeUrl = `${origin}/${locale}`;

  // JSON-LD: BreadcrumbList + ItemList (with nested Product items for rich
  // results when products are activated). Empty product list still emits a
  // valid (empty) ItemList — no broken markup.
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Oak Fantasy', item: homeUrl },
      { '@type': 'ListItem', position: 2, name: content.meta.title, item: canonicalUrl },
    ],
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: locale === 'ro' ? p.name_ro : p.name_en,
        description:
          (locale === 'ro' ? p.short_description_ro : p.short_description_en) ?? '',
        sku: p.sku,
        url: `${canonicalUrl}#${p.slug}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'RON',
          price: formatPriceRon(p.price_ron, 'en').replace(/[.,]/g, ''),
          availability: 'https://schema.org/PreOrder',
          url: `${homeUrl}?interested_product=${p.slug}#waitlist`,
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldSafe(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldSafe(itemList) }}
      />
      <TocatoareContent locale={locale} products={products} />
    </>
  );
}
