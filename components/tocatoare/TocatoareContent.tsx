'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { TOCATOARE_CONTENT } from './content';
import TocatoareHero from './TocatoareHero';
import TocatoareCatalog from './TocatoareCatalog';
import TocatoareBottomCTA from './TocatoareBottomCTA';
import type { Database } from '@/types/supabase';

type Product = Database['public']['Tables']['products']['Row'];

interface Props {
  locale: Locale;
  products: Product[];
}

// Client wrapper for /tocatoare: Navbar (with language toggle that preserves
// the route key via localizedPath) + Hero + Catalog (filter/sort/grid) + CTA +
// Footer. Mirrors the AtelierContent / AboutContent pattern.
export default function TocatoareContent({ locale, products }: Props) {
  const router = useRouter();
  const content = TOCATOARE_CONTENT[locale];

  const toggleLanguage = () => {
    const next: Locale = locale === 'ro' ? 'en' : 'ro';
    router.push(localizedPath('tocatoare', next));
  };

  return (
    <div>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} />
      <main>
        <TocatoareHero content={content} />
        <TocatoareCatalog products={products} content={content} locale={locale} />
        <TocatoareBottomCTA content={content} />
      </main>
      <Footer language={locale} />
    </div>
  );
}
