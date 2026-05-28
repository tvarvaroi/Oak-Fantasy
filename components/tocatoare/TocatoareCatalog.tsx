'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import styles from './tocatoare.module.css';
import ProductCard from './ProductCard';
import type { TocatoareContent, Tier } from './content';
import type { Locale } from '@/lib/i18n-routes';
import type { Database } from '@/types/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type FilterKey = 'all' | Tier;
type SortKey = 'default' | 'price-asc' | 'price-desc';

interface CatalogProps {
  products: Product[];
  content: TocatoareContent;
  locale: Locale;
}

export default function TocatoareCatalog({ products, content, locale }: CatalogProps) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('default');
  const [sortOpen, setSortOpen] = useState(false);
  const sortWrapRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    const onClick = (e: MouseEvent) => {
      if (sortWrapRef.current && !sortWrapRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [sortOpen]);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: products.length,
      entry: 0,
      core: 0,
      premium: 0,
      hero: 0,
    };
    for (const p of products) c[p.tier as Tier] += 1;
    return c;
  }, [products]);

  const visible = useMemo(() => {
    let list = products.slice();
    if (filter !== 'all') list = list.filter((p) => p.tier === filter);
    if (sort === 'price-asc') list.sort((a, b) => a.price_ron - b.price_ron);
    else if (sort === 'price-desc') list.sort((a, b) => b.price_ron - a.price_ron);
    return list;
  }, [products, filter, sort]);

  const sortLabel =
    sort === 'price-asc'
      ? content.sort.options.priceAsc
      : sort === 'price-desc'
        ? content.sort.options.priceDesc
        : content.sort.button;

  const tierKeys: FilterKey[] = ['all', 'entry', 'core', 'premium', 'hero'];

  return (
    <>
      <div className={styles.filterbar} data-filter-bar>
        <div className={styles.filterbarWrap}>
          <div className={styles.filterRow} role="tablist" aria-label="Filter by tier">
            {tierKeys.map((key) => {
              const label = key === 'all' ? content.filters.all : content.filters[key];
              return (
                <button
                  key={key}
                  type="button"
                  className={`${styles.filterPill}${filter === key ? ' ' + styles.active : ''}`}
                  data-filter={key}
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                >
                  {label} <span className={styles.count}>{counts[key]}</span>
                </button>
              );
            })}
          </div>
          <div
            className={`${styles.sortWrap}${sortOpen ? ' ' + styles.open : ''}`}
            ref={sortWrapRef}
          >
            <button
              type="button"
              className={styles.sortToggle}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              onClick={(e) => {
                e.stopPropagation();
                setSortOpen((v) => !v);
              }}
            >
              <span>{sortLabel}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                <path
                  d="M1 1l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className={styles.sortMenu} role="listbox">
              <button
                type="button"
                className={sort === 'default' ? styles.active : ''}
                data-sort="default"
                onClick={() => {
                  setSort('default');
                  setSortOpen(false);
                }}
              >
                {content.sort.options.default}
              </button>
              <button
                type="button"
                className={sort === 'price-asc' ? styles.active : ''}
                data-sort="price-asc"
                onClick={() => {
                  setSort('price-asc');
                  setSortOpen(false);
                }}
              >
                {content.sort.options.priceAsc}
              </button>
              <button
                type="button"
                className={sort === 'price-desc' ? styles.active : ''}
                data-sort="price-desc"
                onClick={() => {
                  setSort('price-desc');
                  setSortOpen(false);
                }}
              >
                {content.sort.options.priceDesc}
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.catalog} aria-label="Cutting board catalog">
        <div className={styles.catalogWrap}>
          {visible.length > 0 ? (
            <div className={styles.grid} data-product-grid>
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} content={content} locale={locale} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState} data-empty-state>
              <svg
                className={styles.emptyLeaf}
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden
              >
                <path
                  d="M24 44 C24 44 8 32 8 20 C8 12 14 6 24 6 C34 6 40 12 40 20 C40 32 24 44 24 44Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 44 L24 10"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
              <h3 className={styles.emptyHeading}>{content.emptyState.heading}</h3>
              <p className={styles.emptyBody}>{content.emptyState.body}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
