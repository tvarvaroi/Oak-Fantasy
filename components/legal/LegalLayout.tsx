import type { Locale } from '@/lib/i18n-routes';

import LegalBlocks from './LegalBlocks';
import LegalCompanyInfo from './LegalCompanyInfo';
import LegalHero from './LegalHero';
import LegalSection from './LegalSection';
import LegalToc from './LegalToc';
import type { LegalContent } from './content';
import { renderLegalInline } from './LegalText';

interface LegalLayoutProps {
  content: LegalContent;
  locale: Locale;
}

// Shared layout for /termeni, /confidentialitate and /retur: hero with the
// "last updated" date, a plain-language lead, the table of contents, the
// numbered sections and the merchant identity card. Server component — all
// copy is server-rendered (LegalShell only adds the client chrome).
export default function LegalLayout({ content, locale }: LegalLayoutProps) {
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
        className="mx-auto px-5 sm:px-8"
        style={{
          maxWidth: 720,
          paddingBottom: 'clamp(72px, 12vh, 140px)',
          paddingTop: 'clamp(8px, 1.5vh, 16px)',
        }}
      >
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <p
              className="font-lora"
              style={{ margin: 0, color: 'var(--ink-soft)', fontSize: '1.06rem', lineHeight: 1.75 }}
            >
              {renderLegalInline(content.intro, locale)}
            </p>
            <LegalToc label={content.tocLabel} sections={content.sections} />
          </div>

          {content.sections.map((section, index) => (
            <div key={section.id} className="flex flex-col">
              <LegalSection id={section.id} index={index + 1} title={section.title}>
                <LegalBlocks blocks={section.blocks} locale={locale} />
              </LegalSection>

              {index < content.sections.length - 1 ? (
                <div
                  aria-hidden
                  style={{
                    marginTop: 36,
                    width: 60,
                    height: 1,
                    backgroundColor: 'var(--copper)',
                    opacity: 0.3,
                  }}
                />
              ) : null}
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
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
