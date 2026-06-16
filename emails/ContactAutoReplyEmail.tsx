import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

import { LEGAL_INFO } from '@/lib/legal-info';

export interface ContactAutoReplyEmailProps {
  name: string;
  locale: 'ro' | 'en';
}

const palette = {
  creamWarm: '#F5EBD8',
  paperAged: '#EDE0C5',
  ink: '#2A2218',
  inkSoft: '#5D4E3A',
  oakWarm: '#8B5E3C',
  oakDeep: '#5C3A20',
  copper: '#B87333',
  highlight: '#C9A66B',
};

const fonts = {
  display: '"Caudex", Georgia, "Times New Roman", serif',
  body: '"Lora", Georgia, "Times New Roman", serif',
  script: '"Caveat", "Brush Script MT", cursive',
};

const copy = {
  ro: {
    preview: 'Mulțumim că ne-ai scris — răspundem în 24 de ore.',
    label: 'Mulțumim',
    headline: 'Am primit mesajul tău',
    greeting: (n: string) => `Salut ${n},`,
    bodyLines: [
      'Îți mulțumim că ne-ai scris. Răspundem în cel mult 24 de ore (zile lucrătoare), direct din atelier.',
      'Între timp, dacă ai un minut, descoperă povestea noastră și produsele care prind formă în atelier:',
    ],
    cta: [
      { label: 'Povestea atelierului', href: '/atelier' },
      { label: 'Tocătoarele noastre', href: '/tocatoare' },
      { label: 'Despre noi', href: '/despre' },
    ],
    sign: 'O zi cu lemn proaspăt,',
    team: 'Echipa Oak Fantasy',
    autoNote: (email: string) =>
      `Acest mesaj a fost generat automat. Pentru un răspuns rapid, scrie la ${email}.`,
    legalLine: (name: string, cui: string, domain: string) =>
      `${name} · CUI ${cui} · ${domain}`,
  },
  en: {
    preview: 'Thanks for writing — we reply within 24 hours.',
    label: 'Thank you',
    headline: 'We received your message',
    greeting: (n: string) => `Hi ${n},`,
    bodyLines: [
      "Thanks for reaching out. We'll get back to you within 24 hours on business days, straight from the workshop.",
      'Meanwhile, take a minute to explore the story behind the work and the boards taking shape on the bench:',
    ],
    cta: [
      { label: 'Inside the workshop', href: '/workshop' },
      { label: 'Our cutting boards', href: '/cutting-boards' },
      { label: 'About us', href: '/about' },
    ],
    sign: 'With fresh wood on the bench,',
    team: 'The Oak Fantasy team',
    autoNote: (email: string) =>
      `This is an automated message. For a faster reply, write to ${email}.`,
    legalLine: (name: string, cui: string, domain: string) =>
      `${name} · CUI ${cui} · ${domain}`,
  },
} as const;

export default function ContactAutoReplyEmail({
  name,
  locale,
}: ContactAutoReplyEmailProps) {
  const t = copy[locale];
  const siteOrigin = `https://${LEGAL_INFO.brandDomain}`;

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body
        style={{
          backgroundColor: palette.creamWarm,
          fontFamily: fonts.body,
          color: palette.ink,
          margin: 0,
          padding: '24px 0',
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            margin: '0 auto',
            backgroundColor: palette.paperAged,
            border: `1px solid ${palette.oakWarm}33`,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Section
            style={{
              padding: '32px 36px 22px',
              borderBottom: `1px solid ${palette.oakWarm}22`,
            }}
          >
            <Text
              style={{
                margin: 0,
                fontFamily: fonts.display,
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: palette.copper,
              }}
            >
              {t.label} — {LEGAL_INFO.brandName}
            </Text>
            <Heading
              as="h1"
              style={{
                margin: '10px 0 0',
                fontFamily: fonts.display,
                fontSize: 26,
                fontWeight: 700,
                color: palette.oakDeep,
                lineHeight: 1.2,
              }}
            >
              {t.headline}
            </Heading>
          </Section>

          <Section style={{ padding: '24px 36px 8px' }}>
            <Text
              style={{
                margin: '0 0 12px',
                fontFamily: fonts.body,
                fontSize: 16,
                lineHeight: 1.65,
                color: palette.ink,
              }}
            >
              {t.greeting(name)}
            </Text>
            {t.bodyLines.map((line, i) => (
              <Text
                key={i}
                style={{
                  margin: '0 0 12px',
                  fontFamily: fonts.body,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: palette.ink,
                }}
              >
                {line}
              </Text>
            ))}
          </Section>

          <Section style={{ padding: '4px 36px 8px' }}>
            {t.cta.map((item) => (
              <Text
                key={item.href}
                style={{
                  margin: '4px 0',
                  fontFamily: fonts.body,
                  fontSize: 15,
                  lineHeight: 1.55,
                }}
              >
                →{' '}
                <Link
                  href={`${siteOrigin}/${locale}${item.href}`}
                  style={{
                    color: palette.oakWarm,
                    textDecoration: 'underline',
                  }}
                >
                  {item.label}
                </Link>
              </Text>
            ))}
          </Section>

          <Hr
            style={{
              borderColor: `${palette.oakWarm}33`,
              margin: '20px 36px 16px',
            }}
          />

          <Section style={{ padding: '0 36px 26px' }}>
            <Text
              style={{
                margin: 0,
                fontFamily: fonts.body,
                fontSize: 15,
                lineHeight: 1.55,
                color: palette.ink,
              }}
            >
              {t.sign}
            </Text>
            <Text
              style={{
                margin: '2px 0 0',
                fontFamily: fonts.script,
                fontSize: 22,
                color: palette.oakWarm,
                transform: 'rotate(-1deg)',
              }}
            >
              {t.team}
            </Text>
          </Section>

          <Section
            style={{
              padding: '14px 36px 22px',
              backgroundColor: palette.creamWarm,
              borderTop: `1px solid ${palette.oakWarm}22`,
            }}
          >
            <Text
              style={{
                margin: 0,
                fontFamily: fonts.body,
                fontSize: 12,
                lineHeight: 1.55,
                color: palette.inkSoft,
              }}
            >
              {t.autoNote(LEGAL_INFO.contactEmail)}
            </Text>
            <Text
              style={{
                margin: '6px 0 0',
                fontFamily: fonts.body,
                fontSize: 11,
                color: palette.inkSoft,
                opacity: 0.7,
              }}
            >
              {t.legalLine(
                LEGAL_INFO.companyName,
                LEGAL_INFO.cui,
                LEGAL_INFO.brandDomain,
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
