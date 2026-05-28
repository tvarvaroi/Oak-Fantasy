'use client';

import Link from 'next/link';
import styles from './tocatoare.module.css';
import { formatPriceRon, formatDimensions } from './content';
import type { TocatoareContent, Tier } from './content';
import type { Locale } from '@/lib/i18n-routes';
import type { Database } from '@/types/supabase';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
  content: TocatoareContent;
  locale: Locale;
}

export default function ProductCard({ product, content, locale }: ProductCardProps) {
  const name = locale === 'ro' ? product.name_ro : product.name_en;
  const desc =
    locale === 'ro' ? product.short_description_ro : product.short_description_en;
  const dims = formatDimensions(product.dimensions, locale);
  const tier = product.tier as Tier;
  // Until product detail pages + cart ship (Etapa 3+), both CTAs route to the
  // homepage waitlist with ?interested_product=slug so the Etapa 2.6 subscriber
  // capture can later pre-fill the email-subscribers.interested_product_ids[].
  const ctaHref = `/${locale}?interested_product=${product.slug}#waitlist`;

  return (
    <article
      className={styles.card}
      data-product
      data-tier={product.tier}
      data-price={product.price_ron}
      data-slug={product.slug}
    >
      <div className={styles.medallion}>
        <span className={styles.photoBadge}>{content.card.photoBadge}</span>
        {/* Decorative placeholder until the product photo shoot ships;
            see HANDOFF.md "Logo / product placeholders". */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg"
          alt=""
          className={styles.medallionLogo}
          aria-hidden
        />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.tierRow}>
          <span className={styles.tierChip}>{content.tierDisplay[tier]}</span>
          {dims && <span className={styles.dims}>{dims}</span>}
        </div>
        <h3 className={styles.cardTitle}>{name}</h3>
        {desc && <p className={styles.cardDesc}>{desc}</p>}
        <div className={styles.cardFoot}>
          <span className={styles.price}>
            {formatPriceRon(product.price_ron, locale)}
            <span className={styles.priceUnit}>{content.card.priceUnit}</span>
          </span>
          <div className={styles.cardCtaRow}>
            <Link href={ctaHref} className={styles.cardCta} data-card-cta>
              {content.card.seeDetails}
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                <path
                  d="M1 5h12M9 1l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href={ctaHref}
              className={styles.quickAdd}
              aria-label={content.card.quickAddAria}
              data-quick-add
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 5h2l2.5 11h10l2-8H7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="19.5" r="1.4" fill="currentColor" />
                <circle cx="17" cy="19.5" r="1.4" fill="currentColor" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
