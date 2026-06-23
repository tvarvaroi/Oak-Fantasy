import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

import { LEGAL_INFO } from '@/lib/legal-info';

// Client-facing order confirmation (Task 3.5). RO/EN by order.locale. Branded
// like the Sprint-1 contact emails: inline palette (React Email strips Tailwind),
// Caudex/Lora, paper-aged card. Fires on a placed cash-on-delivery order and on
// a card order once payment is confirmed (webhook).

export interface OrderEmailItem {
  name: string; // already resolved to the order's locale
  quantity: number;
  engravingText: string | null;
  lineTotalRon: number; // bani
}

export interface OrderConfirmationClientProps {
  locale: 'ro' | 'en';
  orderNumber: string;
  paymentMethod: string | null; // 'stripe_card' | 'cod' | ...
  paymentStatus: string; // 'paid' | 'pending' | ...
  items: OrderEmailItem[];
  subtotalRon: number; // bani
  shippingCostRon: number; // bani
  totalRon: number; // bani
  shipping: {
    recipientName: string;
    street: string;
    city: string;
    county: string;
    postalCode: string;
    phone: string;
  } | null;
  orderUrl: string; // absolute /multumim/[orderId]
  siteOrigin: string; // https://oakfantasy.ro
  // Test-mode (Resend sandbox / no verified domain): this email is redirected to
  // the founder; the banner shows who it would have reached (D2).
  testMode?: boolean;
  intendedRecipient?: string;
}

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
  script: '"Caveat", "Brush Script MT", cursive',
};

const copy = {
  ro: {
    label: 'Comandă primită',
    headline: 'Îți mulțumim pentru comandă',
    intro:
      'Am primit comanda ta și o pregătim cu drag în atelier. Mai jos găsești rezumatul.',
    orderNumberLabel: 'Număr comandă',
    statusPaid: 'Plata cu cardul a fost confirmată. Începem lucrul la comanda ta.',
    statusCod: 'Plata se face ramburs, la livrare. Pregătim comanda pentru expediere.',
    statusPending: 'Așteptăm confirmarea plății.',
    itemsHeading: 'Produse',
    engraving: 'Gravare',
    subtotal: 'Subtotal',
    shipping: 'Transport',
    freeShipping: 'Gratuit',
    total: 'Total',
    shippingToHeading: 'Livrare către',
    leadTime: 'Estimăm livrarea în 5–10 zile lucrătoare.',
    viewOrder: 'Vezi comanda',
    browse: 'Vezi tocătoarele',
    sign: 'Cu lemn proaspăt pe banc,',
    team: 'Echipa Oak Fantasy',
    priceUnit: 'RON',
    autoNote:
      'Acest mesaj a fost generat automat. Dacă ai întrebări, scrie-ne oricând.',
  },
  en: {
    label: 'Order received',
    headline: 'Thank you for your order',
    intro:
      "We've received your order and we're preparing it by hand in the workshop. Here's the summary.",
    orderNumberLabel: 'Order number',
    statusPaid: 'Your card payment is confirmed. We are starting work on your order.',
    statusCod: 'Payment is cash on delivery. We are preparing your order for shipping.',
    statusPending: 'We are waiting for payment confirmation.',
    itemsHeading: 'Items',
    engraving: 'Engraving',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    freeShipping: 'Free',
    total: 'Total',
    shippingToHeading: 'Shipping to',
    leadTime: 'Estimated delivery in 5–10 business days.',
    viewOrder: 'View order',
    browse: 'Browse our boards',
    sign: 'With fresh wood on the bench,',
    team: 'The Oak Fantasy team',
    priceUnit: 'RON',
    autoNote:
      'This is an automated message. If you have questions, write to us anytime.',
  },
} as const;

function formatBani(bani: number, locale: 'ro' | 'en'): string {
  return (bani / 100).toLocaleString(locale === 'ro' ? 'ro-RO' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function OrderConfirmationClient({
  locale,
  orderNumber,
  paymentMethod,
  paymentStatus,
  items,
  subtotalRon,
  shippingCostRon,
  totalRon,
  shipping,
  orderUrl,
  siteOrigin,
  testMode = false,
  intendedRecipient,
}: OrderConfirmationClientProps) {
  const t = copy[locale];
  const statusMessage =
    paymentMethod === 'cod'
      ? t.statusCod
      : paymentStatus === 'paid'
        ? t.statusPaid
        : t.statusPending;

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{`${t.label} — ${orderNumber}`}</Preview>
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
          {/* Header */}
          <Section
            style={{
              padding: '30px 34px 20px',
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
                fontSize: 25,
                fontWeight: 700,
                color: palette.oakDeep,
                lineHeight: 1.2,
              }}
            >
              {t.headline}
            </Heading>
          </Section>

          {testMode && (
            <Section
              style={{
                margin: '18px 34px 0',
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
                ⚠️ <strong>TEST MODE</strong> — acest email ar fi mers la{' '}
                <strong>{intendedRecipient}</strong>. A fost redirecționat către
                tine (founder) pentru că domeniul {LEGAL_INFO.brandDomain} nu e
                încă verificat în Resend.
              </Text>
            </Section>
          )}

          {/* Intro + status */}
          <Section style={{ padding: '22px 34px 6px' }}>
            <Text
              style={{
                margin: '0 0 14px',
                fontFamily: fonts.body,
                fontSize: 15,
                lineHeight: 1.65,
                color: palette.ink,
              }}
            >
              {t.intro}
            </Text>
            <Section
              style={{
                padding: '14px 16px',
                backgroundColor: palette.creamWarm,
                border: `1px solid ${palette.oakWarm}22`,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontFamily: fonts.body,
                  fontSize: 13,
                  color: palette.inkSoft,
                }}
              >
                {t.orderNumberLabel}:{' '}
                <span
                  style={{
                    fontFamily: fonts.display,
                    fontWeight: 700,
                    color: palette.oakDeep,
                  }}
                >
                  {orderNumber}
                </span>
              </Text>
              <Text
                style={{
                  margin: '6px 0 0',
                  fontFamily: fonts.body,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: palette.ink,
                }}
              >
                {statusMessage}
              </Text>
            </Section>
          </Section>

          {/* Items */}
          <Section style={{ padding: '20px 34px 0' }}>
            <Text
              style={{
                margin: '0 0 10px',
                fontFamily: fonts.display,
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: palette.inkSoft,
              }}
            >
              {t.itemsHeading}
            </Text>
            {items.map((it, i) => (
              <Row key={i} style={{ marginBottom: 8 }}>
                <Column>
                  <Text
                    style={{
                      margin: 0,
                      fontFamily: fonts.body,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: palette.ink,
                    }}
                  >
                    {it.name} × {it.quantity}
                    {it.engravingText ? (
                      <span style={{ color: palette.inkSoft, fontSize: 12 }}>
                        {' '}
                        · {t.engraving}: “{it.engravingText}”
                      </span>
                    ) : null}
                  </Text>
                </Column>
                <Column style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <Text
                    style={{
                      margin: 0,
                      fontFamily: fonts.body,
                      fontSize: 14,
                      color: palette.ink,
                    }}
                  >
                    {formatBani(it.lineTotalRon, locale)} {t.priceUnit}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr
            style={{
              borderColor: `${palette.oakWarm}33`,
              margin: '14px 34px 12px',
            }}
          />

          {/* Totals */}
          <Section style={{ padding: '0 34px' }}>
            <Row>
              <Column>
                <Text style={totalRowLabel}>{t.subtotal}</Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={totalRowVal}>
                  {formatBani(subtotalRon, locale)} {t.priceUnit}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={totalRowLabel}>{t.shipping}</Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={totalRowVal}>
                  {shippingCostRon > 0
                    ? `${formatBani(shippingCostRon, locale)} ${t.priceUnit}`
                    : t.freeShipping}
                </Text>
              </Column>
            </Row>
            <Row style={{ marginTop: 4 }}>
              <Column>
                <Text
                  style={{
                    ...totalRowLabel,
                    fontFamily: fonts.display,
                    fontWeight: 700,
                    fontSize: 16,
                    color: palette.oakDeep,
                  }}
                >
                  {t.total}
                </Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text
                  style={{
                    ...totalRowVal,
                    fontFamily: fonts.display,
                    fontWeight: 700,
                    fontSize: 18,
                    color: palette.ink,
                  }}
                >
                  {formatBani(totalRon, locale)} {t.priceUnit}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Shipping address */}
          {shipping ? (
            <Section style={{ padding: '20px 34px 0' }}>
              <Text
                style={{
                  margin: '0 0 6px',
                  fontFamily: fonts.display,
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: palette.inkSoft,
                }}
              >
                {t.shippingToHeading}
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontFamily: fonts.body,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: palette.ink,
                }}
              >
                {shipping.recipientName}
                <br />
                {shipping.street}
                <br />
                {shipping.city}, {shipping.county} {shipping.postalCode}
                <br />
                {shipping.phone}
              </Text>
            </Section>
          ) : null}

          {/* Lead time + CTA */}
          <Section style={{ padding: '20px 34px 4px' }}>
            <Text
              style={{
                margin: '0 0 14px',
                fontFamily: fonts.body,
                fontSize: 14,
                lineHeight: 1.6,
                color: palette.inkSoft,
              }}
            >
              {t.leadTime}
            </Text>
            <Text style={{ margin: '0 0 4px', fontFamily: fonts.body, fontSize: 15 }}>
              →{' '}
              <Link href={orderUrl} style={{ color: palette.oakWarm, textDecoration: 'underline' }}>
                {t.viewOrder}
              </Link>
            </Text>
            <Text style={{ margin: 0, fontFamily: fonts.body, fontSize: 15 }}>
              →{' '}
              <Link
                href={`${siteOrigin}/${locale}/${locale === 'ro' ? 'tocatoare' : 'cutting-boards'}`}
                style={{ color: palette.oakWarm, textDecoration: 'underline' }}
              >
                {t.browse}
              </Link>
            </Text>
          </Section>

          {/* Sign-off */}
          <Section style={{ padding: '20px 34px 8px' }}>
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

          {/* Footer */}
          <Section
            style={{
              padding: '14px 34px 22px',
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
              {t.autoNote}
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
              {LEGAL_INFO.companyName} · CUI {LEGAL_INFO.cui} · {LEGAL_INFO.brandDomain}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const totalRowLabel: React.CSSProperties = {
  margin: '0 0 6px',
  fontFamily: '"Lora", Georgia, serif',
  fontSize: 14,
  color: palette.inkSoft,
};
const totalRowVal: React.CSSProperties = {
  margin: '0 0 6px',
  fontFamily: '"Lora", Georgia, serif',
  fontSize: 14,
  color: palette.ink,
};
