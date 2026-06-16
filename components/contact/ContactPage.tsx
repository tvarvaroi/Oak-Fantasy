'use client';

import type { Locale } from '@/lib/i18n-routes';

import ContactForm from './ContactForm';
import ContactHero from './ContactHero';
import ContactInfo from './ContactInfo';
import type { ContactCopy } from './content';

export default function ContactPage({
  copy,
  locale,
}: {
  copy: ContactCopy;
  locale: Locale;
}) {
  return (
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
  );
}
