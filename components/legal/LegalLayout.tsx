import type { Locale } from '@/lib/i18n-routes';

import LegalBanner from './LegalBanner';
import LegalCompanyInfo from './LegalCompanyInfo';
import LegalHero from './LegalHero';
import LegalSection from './LegalSection';
import type { LegalContent, LegalSectionMeta } from './content';

interface LegalLayoutProps {
  content: LegalContent;
  locale: Locale;
  // Optional override for any section's body — used by /retur to insert
  // the OUG 34/2014 Art. 16 c statutory note inside the relevant section
  // without polluting the shared content interface.
  sectionOverrides?: Partial<Record<string, React.ReactNode>>;
}

export default function LegalLayout({
  content,
  locale,
  sectionOverrides,
}: LegalLayoutProps) {
  return (
    <main
      style={{
        backgroundColor: 'var(--cream-warm)',
        minHeight: '100vh',
      }}
    >
      <LegalHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        lastUpdated={content.hero.lastUpdated}
        lastUpdatedLabel={content.hero.lastUpdatedLabel}
      />

      <article
        className="mx-auto px-6 sm:px-8"
        style={{
          maxWidth: 720,
          paddingBottom: 'clamp(72px, 12vh, 140px)',
          paddingTop: 'clamp(8px, 1.5vh, 16px)',
        }}
      >
        <div className="flex flex-col gap-10">
          <LegalBanner
            eyebrow={content.banner.eyebrow}
            bodyTemplate={content.banner.bodyTemplate}
          />

          {content.sections.map((section: LegalSectionMeta, index: number) => (
            <div
              key={section.id}
              className="flex flex-col"
              style={{ gap: 0 }}
            >
              <LegalSection
                id={section.id}
                index={index + 1}
                title={section.title}
                locale={locale}
              >
                {sectionOverrides?.[section.id]}
              </LegalSection>

              {index < content.sections.length - 1 ? (
                <div
                  aria-hidden
                  style={{
                    marginTop: 28,
                    marginBottom: 4,
                    width: 60,
                    height: 1,
                    backgroundColor: 'var(--copper)',
                    opacity: 0.3,
                  }}
                />
              ) : null}
            </div>
          ))}

          <div style={{ marginTop: 28 }}>
            <LegalCompanyInfo
              sectionLabel={content.companyInfo.sectionLabel}
              labels={content.companyInfo.labels}
              placeholderBanner={content.companyInfo.placeholderBanner}
            />
          </div>
        </div>
      </article>
    </main>
  );
}
