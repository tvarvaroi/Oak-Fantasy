'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { PRODUCT_DETAIL_CONTENT } from './content';
import { keepUnits } from '@/lib/typography';
import ProductDescription from './ProductDescription';

// Client wrapper for the product detail page (check #0: global Navbar + Footer +
// language toggle that preserves the product slug). gallery + info are passed in
// as elements from the Server Component page (server components rendered through
// a client component via props — allowed). Same for buyingInfo, the
// "Livrare, plată și retur" block (GEO audit 2026-11-21).

export default function ProductDetailContent({
  locale,
  slug,
  productName,
  longDescription,
  gallery,
  info,
  buyingInfo,
}: {
  locale: Locale;
  slug: string;
  productName: string;
  longDescription: string | null;
  gallery: React.ReactNode;
  info: React.ReactNode;
  buyingInfo: React.ReactNode;
}) {
  const router = useRouter();
  const c = PRODUCT_DETAIL_CONTENT[locale];

  const toggleLanguage = () => {
    const next: Locale = locale === 'ro' ? 'en' : 'ro';
    // Same product, other locale's catalog slug + the (locale-neutral) DB slug.
    router.push(`${localizedPath('tocatoare', next)}/${slug}`);
  };

  return (
    <div>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} />
      <main style={{ backgroundColor: 'var(--cream-warm)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(90px, 12vw, 130px) clamp(20px, 5vw, 56px) clamp(48px, 8vw, 90px)' }}>
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="font-lora" style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 28 }}>
            <Link href={`/${locale}`} style={{ color: 'var(--ink-soft)' }} className="hover:underline">
              {c.breadcrumbHome}
            </Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <Link href={localizedPath('tocatoare', locale)} style={{ color: 'var(--ink-soft)' }} className="hover:underline">
              {c.breadcrumbCatalog}
            </Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: 'var(--ink)' }}>{keepUnits(productName)}</span>
          </nav>

          {/* Gallery | Info */}
          <div className="grid gap-10 lg:gap-14" style={{ gridTemplateColumns: '1fr', alignItems: 'start' }}>
            {/* DOM order = phone order: gallery, info (ends with the buy
                button), then the delivery/payment/returns block — so the block
                never pushes the button down. From lg the block moves under the
                gallery (left column), next to the info column, instead of
                stretching the right column past a short gallery. Row 2 is 1fr
                so the info column's extra height never opens a gap between the
                gallery and the block. */}
            <div className="grid gap-10 lg:gap-x-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr]">
              <div className="lg:col-start-1 lg:row-start-1">{gallery}</div>
              <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">{info}</div>
              <div className="lg:col-start-1 lg:row-start-2">{buyingInfo}</div>
            </div>

            {/* Long description */}
            {longDescription ? (
              <section style={{ maxWidth: 760, marginTop: 'clamp(32px, 5vw, 56px)' }}>
                <h2 className="font-caudex" style={{ fontSize: '1.4rem', color: 'var(--oak-deep)', fontWeight: 700, marginBottom: 16 }}>
                  {c.detailsHeading}
                </h2>
                <ProductDescription text={longDescription} />
              </section>
            ) : null}
          </div>
        </div>
      </main>
      <Footer language={locale} />
    </div>
  );
}
