import { revalidatePath } from 'next/cache';

// Refreshing the PUBLIC pages after an admin change — one place, used by the
// product, stock and order actions. (Not a 'use server' file: those may only
// export async functions.)
//
// Pages live under app/[locale]/…, so a page is tagged with its route pattern
// ('/[locale]/tocatoare/page') and with the requested path ('/ro/tocatoare').
// A bare revalidatePath('/tocatoare') or `/tocatoare/${slug}` matches neither
// and refreshes nothing (gotchas.md, 2026-11-21) — always the pattern + 'page'.
//
// Never throws: the row is already saved when this runs, and a cache refresh
// that fails must not be reported to the admin as a failed save (the pages
// still refresh on their own within the ISR window).

/**
 * Availability changed (stock set by hand, an order cancelled): the catalogue
 * and the product pages. The homepage and the sitemap do not show stock.
 */
export function revalidateProductPages(): void {
  try {
    revalidatePath('/[locale]/tocatoare', 'page');
    revalidatePath('/[locale]/tocatoare/[slug]', 'page');
  } catch (err) {
    console.warn('[products] public revalidation failed', err);
  }
}

/**
 * A product row changed (created, edited, put on or taken off sale): the pages
 * above, plus the homepage (its number of models) and the sitemap (the list of
 * product URLs and their lastmod).
 */
export function revalidateProductCatalogue(): void {
  revalidateProductPages();
  try {
    revalidatePath('/[locale]', 'page');
    revalidatePath('/sitemap.xml');
  } catch (err) {
    console.warn('[products] public revalidation failed', err);
  }
}
