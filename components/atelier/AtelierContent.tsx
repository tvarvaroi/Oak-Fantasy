'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { ATELIER_CONTENT } from './content';
import AtelierHero from './AtelierHero';
import ToolsSection from './ToolsSection';
import WorkshopPlace from './WorkshopPlace';
import DayInAtelier from './DayInAtelier';
import PullQuoteBridge from './PullQuoteBridge';
import ProcessSummary from './ProcessSummary';
import Conditions from './Conditions';
import Seasonality from './Seasonality';
import RelatedArticles from './RelatedArticles';
import AtelierCTA from './AtelierCTA';

// Client wrapper for the /atelier page: Navbar (with language toggle that
// preserves the route key via localizedPath) + 10 sections + Footer.

export default function AtelierContent({ locale }: { locale: Locale }) {
  const router = useRouter();
  const content = ATELIER_CONTENT[locale];

  const toggleLanguage = () => {
    const next: Locale = locale === 'ro' ? 'en' : 'ro';
    router.push(localizedPath('atelier', next));
  };

  return (
    <div>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} darkHero />
      <main>
        <AtelierHero content={content} />
        <ToolsSection content={content} />
        <WorkshopPlace content={content} />
        <DayInAtelier content={content} />
        <PullQuoteBridge content={content} />
        <ProcessSummary content={content} locale={locale} />
        <Conditions content={content} />
        <Seasonality content={content} />
        <RelatedArticles content={content} />
        <AtelierCTA content={content} locale={locale} />
      </main>
      <Footer language={locale} />
    </div>
  );
}
