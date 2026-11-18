'use client';

import { useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { localizedPath, type Locale } from '@/lib/i18n-routes';

import { CUSTOM_ORDER_CONTENT } from './content';
import CustomOrderHero from './CustomOrderHero';
import WhatWeMake from './WhatWeMake';
import HowItWorks from './HowItWorks';
import CustomOrderCTA from './CustomOrderCTA';

// Client wrapper for /la-comanda · /custom-orders — mounts Navbar + Footer
// (they are NOT in the global layout; see gotcha 2026-06-18) and keeps the
// language toggle on this route.

export default function CustomOrderContent({ locale }: { locale: Locale }) {
  const router = useRouter();
  const copy = CUSTOM_ORDER_CONTENT[locale];

  const toggleLanguage = () => {
    const next: Locale = locale === 'ro' ? 'en' : 'ro';
    router.push(localizedPath('laComanda', next));
  };

  return (
    <>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} />
      <main>
        <CustomOrderHero copy={copy} locale={locale} />
        <WhatWeMake copy={copy.make} />
        {/* Gallery slot — when the photos exist, a <CustomOrderGallery /> section
            goes here (after "what we can make", before "how it works"). Nothing
            renders until then: no placeholders, no stock images. */}
        <HowItWorks copy={copy.steps} />
        <CustomOrderCTA copy={copy.cta} />
      </main>
      <Footer language={locale} />
    </>
  );
}
