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
import type { OrderEmailItem } from './OrderConfirmationClient';

// Internal admin notification (Task 3.5). Always Romanian, sent to
// RESEND_ADMIN_EMAIL on every placed order (cash-on-delivery now, card on
// payment confirmation). Surfaces customer contact + items + total + a link
// straight to /admin/comenzi.

export interface OrderNotificationAdminProps {
  orderNumber: string;
  orderLocale: 'ro' | 'en';
  paymentMethod: string | null;
  paymentStatus: string;
  status: string; // order.status (pending_cod / confirmed / ...)
  customerEmail: string | null;
  customerPhone: string | null;
  items: OrderEmailItem[]; // name resolved to RO for the admin view
  subtotalRon: number;
  shippingCostRon: number;
  totalRon: number;
  shipping: {
    recipientName: string;
    street: string;
    city: string;
    county: string;
    postalCode: string;
    phone: string;
  } | null;
  customerNotes: string | null;
  adminOrdersUrl: string;
}

const palette = {
  creamWarm: '#F5EBD8',
  paperAged: '#EDE0C5',
  ink: '#2A2218',
  inkSoft: '#5D4E3A',
  oakWarm: '#8B5E3C',
  oakDeep: '#5C3A20',
  copper: '#B87333',
  forestMid: '#5A6B3C',
};

const fonts = {
  display: '"Caudex", Georgia, "Times New Roman", serif',
  body: '"Lora", Georgia, "Times New Roman", serif',
};

function formatBani(bani: number): string {
  return (bani / 100).toLocaleString('ro-RO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function paymentLabel(method: string | null, paymentStatus: string): string {
  if (method === 'cod') return 'Ramburs (plata la livrare)';
  if (method === 'stripe_card') {
    return paymentStatus === 'paid' ? 'Card — PLĂTIT' : 'Card — în așteptare';
  }
  return method ?? '—';
}

export default function OrderNotificationAdmin({
  orderNumber,
  orderLocale,
  paymentMethod,
  paymentStatus,
  status,
  customerEmail,
  customerPhone,
  items,
  subtotalRon,
  shippingCostRon,
  totalRon,
  shipping,
  customerNotes,
  adminOrdersUrl,
}: OrderNotificationAdminProps) {
  return (
    <Html lang="ro">
      <Head />
      <Preview>{`Comandă nouă ${orderNumber} — ${formatBani(totalRon)} RON`}</Preview>
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
              {LEGAL_INFO.brandName} — Admin
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
              Comandă nouă {orderNumber}
            </Heading>
          </Section>

          <Section style={{ padding: '22px 32px 8px' }}>
            <FieldRow label="Plată" value={paymentLabel(paymentMethod, paymentStatus)} />
            <FieldRow label="Status" value={status} />
            <FieldRow label="Limbă" value={orderLocale.toUpperCase()} />
            <FieldRow label="Email" value={customerEmail ?? '—'} />
            <FieldRow label="Telefon" value={customerPhone ?? '—'} />
          </Section>

          <Hr style={{ borderColor: `${palette.oakWarm}33`, margin: '4px 32px 14px' }} />

          {/* Items */}
          <Section style={{ padding: '0 32px' }}>
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
              Produse
            </Text>
            {items.map((it, i) => (
              <Row key={i} style={{ marginBottom: 8 }}>
                <Column>
                  <Text style={{ margin: 0, fontFamily: fonts.body, fontSize: 14, color: palette.ink }}>
                    {it.name} × {it.quantity}
                    {it.engravingText ? (
                      <span style={{ color: palette.inkSoft, fontSize: 12 }}>
                        {' '}
                        · Gravare: “{it.engravingText}”
                      </span>
                    ) : null}
                  </Text>
                </Column>
                <Column style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <Text style={{ margin: 0, fontFamily: fonts.body, fontSize: 14, color: palette.ink }}>
                    {formatBani(it.lineTotalRon)} RON
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={{ borderColor: `${palette.oakWarm}33`, margin: '12px 32px' }} />

          <Section style={{ padding: '0 32px' }}>
            <Row>
              <Column>
                <Text style={{ margin: '0 0 4px', fontFamily: fonts.body, fontSize: 13, color: palette.inkSoft }}>
                  Subtotal
                </Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ margin: '0 0 4px', fontFamily: fonts.body, fontSize: 13, color: palette.ink }}>
                  {formatBani(subtotalRon)} RON
                </Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={{ margin: '0 0 4px', fontFamily: fonts.body, fontSize: 13, color: palette.inkSoft }}>
                  Transport
                </Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ margin: '0 0 4px', fontFamily: fonts.body, fontSize: 13, color: palette.ink }}>
                  {shippingCostRon > 0 ? `${formatBani(shippingCostRon)} RON` : 'Gratuit'}
                </Text>
              </Column>
            </Row>
            <Row style={{ marginTop: 2 }}>
              <Column>
                <Text style={{ margin: 0, fontFamily: fonts.display, fontWeight: 700, fontSize: 16, color: palette.oakDeep }}>
                  Total
                </Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ margin: 0, fontFamily: fonts.display, fontWeight: 700, fontSize: 18, color: palette.ink }}>
                  {formatBani(totalRon)} RON
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Shipping */}
          {shipping ? (
            <Section style={{ padding: '18px 32px 0' }}>
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
                Livrare către
              </Text>
              <Text style={{ margin: 0, fontFamily: fonts.body, fontSize: 14, lineHeight: 1.55, color: palette.ink }}>
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

          {customerNotes ? (
            <Section style={{ padding: '16px 32px 0' }}>
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
                Observații client
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontFamily: fonts.body,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: palette.ink,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {customerNotes}
              </Text>
            </Section>
          ) : null}

          <Section style={{ padding: '22px 32px 26px' }}>
            <Text style={{ margin: 0, fontFamily: fonts.body, fontSize: 15 }}>
              →{' '}
              <Link href={adminOrdersUrl} style={{ color: palette.oakWarm, textDecoration: 'underline' }}>
                Deschide în panoul de comenzi
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ margin: '0 0 10px', fontFamily: fonts.body, fontSize: 14, lineHeight: 1.5, color: palette.ink }}>
      <span
        style={{
          display: 'inline-block',
          minWidth: 80,
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
