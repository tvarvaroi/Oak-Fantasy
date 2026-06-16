import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

import { LEGAL_INFO } from '@/lib/legal-info';
import {
  SUBJECT_LABELS,
  type ContactSubject,
} from '@/lib/schemas/contact';

export interface ContactAdminEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: ContactSubject;
  message: string;
  locale: 'ro' | 'en';
  submittedAt: string;
  ip: string;
  // When true (Resend in test-mode i.e. no verified domain), the API route
  // could not send the auto-reply to the user. The admin email surfaces a
  // warning banner so the founder knows to reply manually.
  testMode?: boolean;
}

// Inline-style palette mirrored from app/globals.css. React Email strips
// CSS-in-JS / Tailwind, so every color is hard-coded here.
const palette = {
  creamWarm: '#F5EBD8',
  paperAged: '#EDE0C5',
  bark: '#1F1810',
  ink: '#2A2218',
  inkSoft: '#5D4E3A',
  oakWarm: '#8B5E3C',
  oakDeep: '#5C3A20',
  copper: '#B87333',
  highlight: '#C9A66B',
  forestMid: '#5A6B3C',
  warnBg: '#FBE4C0',
  warnInk: '#8C5A1A',
};

const fonts = {
  display: '"Caudex", Georgia, "Times New Roman", serif',
  body: '"Lora", Georgia, "Times New Roman", serif',
};

export default function ContactAdminEmail({
  name,
  email,
  phone,
  subject,
  message,
  locale,
  submittedAt,
  ip,
  testMode = false,
}: ContactAdminEmailProps) {
  const subjectLabel = SUBJECT_LABELS[locale][subject];
  const headerLabel = locale === 'ro' ? 'Mesaj nou' : 'New message';
  const previewText = `${headerLabel}: ${subjectLabel} — ${name}`;

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{previewText}</Preview>
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
            maxWidth: 600,
            margin: '0 auto',
            backgroundColor: palette.paperAged,
            border: `1px solid ${palette.oakWarm}33`,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Section
            style={{
              padding: '28px 32px 18px',
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
              {LEGAL_INFO.brandName}
            </Text>
            <Heading
              as="h1"
              style={{
                margin: '8px 0 0',
                fontFamily: fonts.display,
                fontSize: 22,
                fontWeight: 700,
                color: palette.oakDeep,
                lineHeight: 1.2,
              }}
            >
              {headerLabel}
            </Heading>
          </Section>

          {testMode && (
            <Section
              style={{
                margin: '0 32px',
                marginTop: 18,
                padding: '12px 14px',
                backgroundColor: palette.warnBg,
                border: `1px solid ${palette.warnInk}55`,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontFamily: fonts.body,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: palette.warnInk,
                }}
              >
                ⚠️ <strong>TEST MODE</strong> — auto-reply către {email} NU
                a fost trimisă (Resend sandbox limit). Pre-launch: setup
                <code style={{ marginLeft: 4 }}>oakfantasy.ro</code> domain
                în Resend ca să activăm auto-reply.
              </Text>
            </Section>
          )}

          <Section style={{ padding: '22px 32px 8px' }}>
            <FieldRow label="Nume" value={name} />
            <FieldRow label="Email" value={email} />
            {phone ? <FieldRow label="Telefon" value={phone} /> : null}
            <FieldRow label="Subiect" value={subjectLabel} />
            <FieldRow label="Locale" value={locale.toUpperCase()} />
            <FieldRow label="IP" value={ip} />
            <FieldRow label="Trimis" value={submittedAt} />
          </Section>

          <Hr
            style={{
              borderColor: `${palette.oakWarm}33`,
              margin: '4px 32px 16px',
            }}
          />

          <Section style={{ padding: '0 32px 24px' }}>
            <Text
              style={{
                margin: '0 0 8px',
                fontFamily: fonts.display,
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: palette.inkSoft,
              }}
            >
              Mesaj
            </Text>
            <Text
              style={{
                margin: 0,
                fontFamily: fonts.body,
                fontSize: 15,
                lineHeight: 1.65,
                color: palette.ink,
                whiteSpace: 'pre-wrap',
              }}
            >
              {message}
            </Text>
          </Section>

          <Section
            style={{
              padding: '14px 32px 22px',
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
              Răspunde direct cu butonul <em>Reply</em> — Reply-To setat la{' '}
              <strong>{email}</strong>.
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
              {LEGAL_INFO.brandName} · {LEGAL_INFO.brandDomain}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <Text
      style={{
        margin: '0 0 10px',
        fontFamily: fonts.body,
        fontSize: 14,
        lineHeight: 1.5,
        color: palette.ink,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          minWidth: 90,
          fontFamily: fonts.display,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: palette.inkSoft,
        }}
      >
        {label}
      </span>
      <span style={{ color: palette.ink }}>{value}</span>
    </Text>
  );
}
