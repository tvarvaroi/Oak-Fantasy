'use client';

import { useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { localizedPath, type Locale } from '@/lib/i18n-routes';

import ContactForm from './ContactForm';
import ContactHero from './ContactHero';
import ContactInfo from './ContactInfo';
import type { ContactCopy } from './content';

// Client wrapper for /contact — mounts the global Navbar + Footer (same
// pattern as AboutContent / AtelierContent). Language toggle swaps between
// the localized URLs via the i18n route helper. PageTransition is already
// applied by app/[locale]/layout.tsx.
export default function ContactPage({
  copy,
  locale,
}: {
  copy: ContactCopy;
  locale: Locale;
}) {
  const router = useRouter();

  const toggleLanguage = () => {
    const next: Locale = locale === 'ro' ? 'en' : 'ro';
    router.push(localizedPath('contact', next));
  };

  return (
    <>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} />
      <main
        style={{
          backgroundColor: 'var(--cream-warm)',
          minHeight: '100vh',
        }}
      >
        <ContactHero copy={copy.hero} />

        <section
          className="mx-auto px-6 sm:px-8"
          style={{
            maxWidth: 1200,
            paddingBottom: 'clamp(72px, 12vh, 140px)',
          }}
          aria-label={copy.form.sectionLabel}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7">
              <ContactForm copy={copy.form} locale={locale} />
            </div>
            <div className="lg:col-span-5">
              <ContactInfo copy={copy.info} locale={locale} />
            </div>
          </div>
        </section>
      </main>
      <Footer language={locale} />
    </>
  );
}
