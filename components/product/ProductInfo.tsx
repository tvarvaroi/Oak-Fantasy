import type { Locale } from '@/lib/i18n-routes';
import type { CatalogProduct } from '@/lib/db/products';
import { formatPriceRon, formatDimensions, TOCATOARE_CONTENT, type Tier } from '@/components/tocatoare/content';
import { PRODUCT_DETAIL_CONTENT } from './content';
import AddToCartButton from './AddToCartButton';

// Right column of the detail page: name, tier, price (+ sale), short
// description, dimensions, weight, engraving availability, add-to-cart.
// Server component; AddToCartButton is the only client island.

function formatWeight(kg: number, locale: Locale): string {
  const n = kg.toString().replace('.', locale === 'ro' ? ',' : '.');
  return `${n} kg`;
}

export default function ProductInfo({ product, locale }: { product: CatalogProduct; locale: Locale }) {
  const c = PRODUCT_DETAIL_CONTENT[locale];
  const name = locale === 'ro' ? product.name_ro : product.name_en;
  const shortDesc = locale === 'ro' ? product.short_description_ro : product.short_description_en;
  const tierLabel = TOCATOARE_CONTENT[locale].tierDisplay[product.tier as Tier];
  const dims = formatDimensions(product.dimensions, locale);

  const hasSale =
    product.compare_at_price_ron != null && product.compare_at_price_ron > product.price_ron;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span
          className="font-caveat inline-block"
          style={{ color: 'var(--copper)', fontSize: '1.25rem', transform: 'rotate(-1deg)' }}
        >
          {tierLabel}
        </span>
        <h1
          className="font-caudex"
          style={{ marginTop: 4, fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', color: 'var(--oak-deep)', fontWeight: 700, lineHeight: 1.1 }}
        >
          {name}
        </h1>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="font-caudex" style={{ fontSize: '1.9rem', color: 'var(--ink)', fontWeight: 700 }}>
          {formatPriceRon(product.price_ron, locale)}{' '}
          <span style={{ fontSize: '1rem', color: 'var(--ink-soft)' }}>{c.priceUnit}</span>
        </span>
        {hasSale ? (
          <>
            <span
              className="font-lora"
              style={{ fontSize: '1.1rem', color: 'var(--ink-soft)', textDecoration: 'line-through' }}
            >
              {formatPriceRon(product.compare_at_price_ron as number, locale)} {c.priceUnit}
            </span>
            <span
              className="label-caps"
              style={{ backgroundColor: 'rgba(184,115,51,0.16)', color: 'var(--copper)', borderRadius: 999, padding: '3px 10px', fontSize: '0.58rem' }}
            >
              {c.saleLabel}
            </span>
          </>
        ) : null}
      </div>

      {shortDesc ? (
        <p className="font-lora" style={{ fontSize: '1.05rem', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
          {shortDesc}
        </p>
      ) : null}

      {/* Specs */}
      <dl className="flex flex-col gap-2" style={{ borderTop: '1px solid rgba(92,58,32,0.15)', paddingTop: 18 }}>
        {dims ? (
          <div className="flex gap-3">
            <dt className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.62rem', minWidth: 110 }}>
              {c.dimensions}
            </dt>
            <dd className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.92rem' }}>
              {dims}
            </dd>
          </div>
        ) : null}
        {product.weight_kg != null ? (
          <div className="flex gap-3">
            <dt className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.62rem', minWidth: 110 }}>
              {c.weight}
            </dt>
            <dd className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.92rem' }}>
              {formatWeight(product.weight_kg, locale)}
            </dd>
          </div>
        ) : null}
      </dl>

      {/* Engraving availability (selection happens in the cart, Task 3.2) */}
      {product.has_engraving_option ? (
        <div
          style={{
            backgroundColor: 'var(--paper-aged)',
            border: '1px solid rgba(92,58,32,0.18)',
            borderRadius: 10,
            padding: '14px 16px',
          }}
        >
          <p className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: '0.95rem' }}>
            {c.engravingTitle}
            {product.engraving_price_ron != null ? (
              <span className="font-lora" style={{ color: 'var(--copper)', fontWeight: 400, marginLeft: 8 }}>
                +{formatPriceRon(product.engraving_price_ron, locale)} {c.priceUnit}
              </span>
            ) : null}
          </p>
          <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginTop: 4 }}>
            {c.engravingNote}
          </p>
        </div>
      ) : null}

      <AddToCartButton label={c.addToCart} comingSoon={c.cartComingSoon} />
    </div>
  );
}
