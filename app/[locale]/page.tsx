'use client';

import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import StoryStrip from '@/components/StoryStrip';
import WorkshopSection from '@/components/WorkshopSection';
import ProductTease from '@/components/ProductTease';
import NumbersStrip from '@/components/NumbersStrip';
import CraftVideoTease from '@/components/CraftVideoTease';
import WaitlistSection from '@/components/WaitlistSection';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';

type Locale = 'ro' | 'en';

export default function LocalePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) ?? 'ro';
  const language: Locale = locale === 'en' ? 'en' : 'ro';

  const toggleLanguage = () => {
    router.push(language === 'ro' ? '/en' : '/ro');
  };

  return (
    <main style={{ backgroundColor: 'var(--cream-warm)' }}>
      <Navbar language={language} onToggleLanguage={toggleLanguage} />
      <Hero language={language} />
      <StoryStrip language={language} />
      <WorkshopSection language={language} />
      <ProductTease language={language} />
      <NumbersStrip language={language} />
      <CraftVideoTease language={language} />
      <WaitlistSection language={language} />
      <Footer language={language} />
      <FloatingCTA language={language} />
    </main>
  );
}
