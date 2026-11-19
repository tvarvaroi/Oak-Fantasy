import HomeClient from '@/components/HomeClient';
import { countActiveProducts } from '@/lib/db/products';

// Server shell for the homepage: reads the live number of active products for
// the NumbersStrip "modele" figure (founder fact-check 2026-11-19 — never a
// hand-written count). Same ISR window as /tocatoare.
export const revalidate = 60;

export default async function LocalePage() {
  const productCount = await countActiveProducts();
  return <HomeClient productCount={productCount} />;
}
