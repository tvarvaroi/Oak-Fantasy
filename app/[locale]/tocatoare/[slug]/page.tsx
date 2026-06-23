import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isLocale, localizedPath, LOCALES, type Locale } from '@/lib/i18n-routes';
import { fetchProductBySlug, fetchActiveProducts } from '@/lib/db/products';
import { PRODUCT_DETAIL_CONTENT } from '@/components/product/content';
import ProductDetailContent from '@/components/product/ProductDetailContent';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';

// ISR (D2): pre-render active products at build, revalidate every 60s so admin
// activations/edits reflect without a redeploy; dynamicParams lets products
// added after build render on-demand. fetchProductBySlug filters status='active'
// so draft/archived slugs (and unknown slugs) 404.

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await fetchActiveProducts();
  return LOCALES.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

// Escape `<` so embedded JSON-LD can't break out of <script>.
function ldSafe(json: unknown): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

interface PageProps {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const product = await fetchProductBySlug(params.slug);
  if (!product) return {};

  const locale = params.locale;
  const name = locale === 'ro' ? product.name_ro : product.name_en;
  const metaTitle =
    (locale === 'ro' ? product.meta_title_ro : product.meta_title_en) || `${name} — Oak Fantasy`;
  const metaDescription =
    (locale === 'ro' ? product.meta_description_ro : product.meta_description_en) ||
    (locale === 'ro' ? product.short_description_ro : product.short_description_en) ||
    '';

  const canonical = `${localizedPath('tocatoare', locale)}/${product.slug}`;
  const roUrl = `${localizedPath('tocatoare', 'ro')}/${product.slug}`;
  const enUrl = `${localizedPath('tocatoare', 'en')}/${product.slug}`;
  const image = product.hero_image_url || '/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg';

  return {
    title: metaTitle,
    description: metaDescription,
    metadataBase: new URL('https://oakfantasy.ro'),
    alternates: {
      canonical,
      languages: { ro: roUrl, en: enUrl, 'x-default': roUrl },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonical,
      type: 'website',
      locale: locale === 'ro' ? 'ro_RO' : 'en_US',
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: metaTitle, description: metaDescription },
  };
}

export default async function ProductPage({ params }: PageProps) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const product = await fetchProductBySlug(params.slug);
  if (!product) notFound();

  const c = PRODUCT_DETAIL_CONTENT[locale];
  const name = locale === 'ro' ? product.name_ro : product.name_en;
  const shortDesc = locale === 'ro' ? product.short_description_ro : product.short_description_en;
  const longDesc = locale === 'ro' ? product.long_description_ro : product.long_description_en;

  // hero first, then gallery; drop nulls; dedupe.
  const images = Array.from(
    new Set([product.hero_image_url, ...(product.gallery_image_urls ?? [])].filter((x): x is string => !!x)),
  );

  const origin = 'https://oakfantasy.ro';
  const canonicalUrl = `${origin}${localizedPath('tocatoare', locale)}/${product.slug}`;
  const homeUrl = `${origin}/${locale}`;
  const catalogUrl = `${origin}${localizedPath('tocatoare', locale)}`;

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: shortDesc ?? '',
    sku: product.sku,
    ...(images.length ? { image: images } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RON',
      price: (product.price_ron / 100).toString(),
      availability: 'https://schema.org/PreOrder',
      url: canonicalUrl,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: c.breadcrumbHome, item: homeUrl },
      { '@type': 'ListItem', position: 2, name: c.breadcrumbCatalog, item: catalogUrl },
      { '@type': 'ListItem', position: 3, name, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldSafe(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldSafe(breadcrumbLd) }} />
      <ProductDetailContent
        locale={locale}
        slug={product.slug}
        productName={name}
        longDescription={longDesc}
        gallery={
          <ProductGallery
            images={images}
            alt={name}
            photoBadge={c.photoBadge}
            thumbAria={c.galleryThumbAria}
          />
        }
        info={<ProductInfo product={product} locale={locale} />}
      />
    </>
  );
}
