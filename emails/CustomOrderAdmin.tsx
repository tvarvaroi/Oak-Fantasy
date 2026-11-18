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

// Admin notification for a new custom-order request from /la-comanda
// (2026-11-18). Always Romanian (it goes to the founder). Same visual language
// as ContactAdminEmail; palette hard-coded because React Email strips CSS vars.

export interface CustomOrderAdminProps {
  name: string;
  /** Display phone, e.g. "0712 345 678". */
  phoneDisplay: string;
  /** wa.me link with a prefilled greeting in the customer's language. */
  whatsappUrl: string | null;
  idea: string;
  locale: 'ro' | 'en';
  submittedAt: string;
  adminUrl: string;
}

const palette = {
  creamWarm: '#F5EBD8',
  paperAged: '#EDE0C5',
  ink: '#2A2218',
  inkSoft: '#5D4E3A',
  oakWarm: '#8B5E3C',
  oakDeep: '#5C3A20',
  copper: '#B87333',
};

const fonts = {
  display: '"Caudex", Georgia, "Times New Roman", serif',
  body: '"Lora", Georgia, "Times New Roman", serif',
};

const capsLabel: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: palette.inkSoft,
};

export default function CustomOrderAdmin({
  name,
  phoneDisplay,
  whatsappUrl,
  idea,
  locale,
  submittedAt,
  adminUrl,
}: CustomOrderAdminProps) {
  return (
    <Html lang="ro">
      <Head />
      <Preview>{`Cerere la comandă de la ${name}`}</Preview>
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
          <Section style={{ padding: '28px 32px 18px', borderBottom: `1px solid ${palette.oakWarm}22` }}>
            <Text style={{ ...capsLabel, margin: 0, fontSize: 11, color: palette.copper }}>
              {LEGAL_INFO.brandName} · La comandă
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
              Cerere nouă de la {name}
            </Heading>
          </Section>

          <Section style={{ padding: '22px 32px 8px' }}>
            <Row label="Nume" value={name} />
            <Text style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.5 }}>
              <span style={{ ...capsLabel, display: 'inline-block', minWidth: 90 }}>Telefon</span>
              {whatsappUrl ? (
                <Link href={whatsappUrl} style={{ color: palette.oakDeep, textDecoration: 'underline' }}>
                  {phoneDisplay} (WhatsApp)
                </Link>
              ) : (
                <span>{phoneDisplay}</span>
              )}
            </Text>
            <Row label="Limbă" value={locale === 'en' ? 'Engleză (EN)' : 'Română (RO)'} />
            <Row label="Primită" value={submittedAt} />
          </Section>

          <Hr style={{ borderColor: `${palette.oakWarm}33`, margin: '4px 32px 16px' }} />

          <Section style={{ padding: '0 32px 24px' }}>
            <Text style={{ ...capsLabel, margin: '0 0 8px' }}>Ideea</Text>
            <Text
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.65,
                color: palette.ink,
                whiteSpace: 'pre-wrap',
              }}
            >
              {idea}
            </Text>
          </Section>

          <Section
            style={{
              padding: '16px 32px 22px',
              backgroundColor: palette.creamWarm,
              borderTop: `1px solid ${palette.oakWarm}22`,
            }}
          >
            <Link
              href={adminUrl}
              style={{
                display: 'inline-block',
                backgroundColor: palette.oakWarm,
                color: palette.creamWarm,
                fontFamily: fonts.display,
                fontSize: 14,
                letterSpacing: '0.04em',
                padding: '10px 20px',
                borderRadius: 6,
                textDecoration: 'none',
              }}
            >
              Deschide în admin
            </Link>
            <Text style={{ margin: '12px 0 0', fontSize: 11, color: palette.inkSoft, opacity: 0.75 }}>
              {LEGAL_INFO.brandName} · {LEGAL_INFO.brandDomain}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.5, color: palette.ink }}>
      <span style={{ ...capsLabel, display: 'inline-block', minWidth: 90 }}>{label}</span>
      <span>{value}</span>
    </Text>
  );
}
