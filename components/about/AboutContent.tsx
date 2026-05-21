'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { ABOUT_CONTENT } from './content';
import AboutHero from './AboutHero';
import ProcessTimeline from './ProcessTimeline';
import PhilosophySection from './PhilosophySection';
import WorkshopBanner from './WorkshopBanner';
import ValuesGrid from './ValuesGrid';
import AboutCTA from './AboutCTA';

// Client wrapper for /despre — reuses the existing Navbar + Footer and
// composes the about sections. Language toggle swaps between the localized
// URLs (/ro/despre <-> /en/about) via the i18n route helper.
// PageTransition is already applied by app/[locale]/layout.tsx.

export default function AboutContent({ locale }: { locale: Locale }) {
  const router = useRouter();
  const content = ABOUT_CONTENT[locale];

  const toggleLanguage = () => {
    const next: Locale = locale === 'ro' ? 'en' : 'ro';
    router.push(localizedPath('despre', next));
  };

  return (
    <>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} />
      <main style={{ backgroundColor: 'var(--cream-warm)' }}>
        <AboutHero content={content} />
        <ProcessTimeline content={content} locale={locale} />
        <PhilosophySection content={content} />
        <WorkshopBanner content={content} locale={locale} />
        <ValuesGrid content={content} />
        <AboutCTA content={content} locale={locale} />
      </main>
      <Footer language={locale} />
    </>
  );
}
