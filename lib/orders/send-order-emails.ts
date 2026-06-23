// SERVER ONLY. Centralized transactional order emails (Task 3.5). Called from
// the cash-on-delivery branch of place-order (order placed) and from the Stripe
// webhook handleCompleted (card payment confirmed). Sends:
//   1. Admin notification → RESEND_ADMIN_EMAIL (always, Romanian)
//   2. Client confirmation → customer email (RO/EN by order.locale)
//
// Best-effort (D5): every failure is caught and logged; this function NEVER
// throws and NEVER blocks/rolls back the order. Idempotency (D4) is handled by
// the callers — the webhook only reaches here once (payment_status guard), the
// COD path runs once.
//
// Test mode (Resend sandbox / unverified domain): both emails go to the founder;
// the client email carries a [TEST → would-be recipient] banner so the founder
// can see the real rendering before oakfantasy.ro is verified (D2).

import { Resend } from 'resend';

import { fetchOrderConfirmation } from './get-order';
import { LEGAL_INFO } from '@/lib/legal-info';
import { localizedPath } from '@/lib/i18n-routes';
import OrderConfirmationClient, {
  type OrderEmailItem,
} from '@/emails/OrderConfirmationClient';
import OrderNotificationAdmin from '@/emails/OrderNotificationAdmin';

const RESEND_SANDBOX_DOMAIN = 'onboarding@resend.dev';

function envOr(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.length > 0 ? v : fallback;
}

function appOrigin(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  return (env || 'https://oak-fantasy.vercel.app').replace(/\/$/, '');
}

interface SnapshotShape {
  name_ro?: string;
  name_en?: string;
}

interface ShippingShape {
  recipient_name?: string;
  street?: string;
  city?: string;
  county?: string;
  postal_code?: string;
  phone?: string;
}

export async function sendOrderEmails(orderId: string): Promise<void> {
  try {
    const result = await fetchOrderConfirmation(orderId);
    if (!result) {
      console.error(`[order-emails] order ${orderId} not found — skipped`);
      return;
    }
    const { order, items } = result;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[order-emails] RESEND_API_KEY missing — emails skipped');
      return;
    }

    const fromEmail = envOr('RESEND_FROM_EMAIL', RESEND_SANDBOX_DOMAIN);
    const adminEmail = envOr('RESEND_ADMIN_EMAIL', 'tvarvaroi@gmail.com');
    const isTestMode = fromEmail === RESEND_SANDBOX_DOMAIN;

    // locale isn't in the generated types until the migration is applied + types
    // regenerated — read it defensively.
    const locale =
      (order as { locale?: string }).locale === 'en' ? 'en' : 'ro';

    const resend = new Resend(apiKey);
    const origin = appOrigin();
    const orderUrl = `${origin}${localizedPath('multumim', locale)}/${order.id}`;
    const adminOrdersUrl = `${origin}/admin/comenzi`;

    const clientItems: OrderEmailItem[] = items.map((it) => {
      const snap = (it.product_snapshot ?? {}) as SnapshotShape;
      return {
        name: (locale === 'ro' ? snap.name_ro : snap.name_en) ?? snap.name_ro ?? '',
        quantity: it.quantity,
        engravingText: it.engraving_text,
        lineTotalRon: it.line_total_ron,
      };
    });
    const adminItems: OrderEmailItem[] = items.map((it) => {
      const snap = (it.product_snapshot ?? {}) as SnapshotShape;
      return {
        name: snap.name_ro ?? snap.name_en ?? '',
        quantity: it.quantity,
        engravingText: it.engraving_text,
        lineTotalRon: it.line_total_ron,
      };
    });

    const sa = (order.shipping_address ?? null) as ShippingShape | null;
    const shipping = sa
      ? {
          recipientName: sa.recipient_name ?? '',
          street: sa.street ?? '',
          city: sa.city ?? '',
          county: sa.county ?? '',
          postalCode: sa.postal_code ?? '',
          phone: sa.phone ?? '',
        }
      : null;

    const from = `${LEGAL_INFO.brandName} <${fromEmail}>`;

    // ── 1. Admin notification (always) ──────────────────────────────────
    try {
      const adminRes = await resend.emails.send({
        from,
        to: adminEmail,
        replyTo: order.guest_email ?? undefined,
        subject: `[${LEGAL_INFO.brandName}] Comandă nouă ${order.order_number}`,
        react: OrderNotificationAdmin({
          orderNumber: order.order_number,
          orderLocale: locale,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          status: order.status,
          customerEmail: order.guest_email,
          customerPhone: order.guest_phone,
          items: adminItems,
          subtotalRon: order.subtotal_ron,
          shippingCostRon: order.shipping_cost_ron,
          totalRon: order.total_ron,
          shipping,
          customerNotes: order.customer_notes,
          adminOrdersUrl,
        }),
      });
      if (adminRes.error) {
        console.error('[order-emails] admin email failed:', adminRes.error);
      }
    } catch (err) {
      console.error('[order-emails] admin email exception:', err);
    }

    // ── 2. Client confirmation ──────────────────────────────────────────
    const intendedRecipient = order.guest_email ?? undefined;
    const clientTo = isTestMode ? adminEmail : intendedRecipient;

    if (!clientTo) {
      console.warn(
        `[order-emails] no client recipient for order ${order.order_number} — client email skipped`,
      );
    } else {
      const subject =
        locale === 'ro'
          ? `Confirmare comandă ${order.order_number} — ${LEGAL_INFO.brandName}`
          : `Order confirmation ${order.order_number} — ${LEGAL_INFO.brandName}`;
      try {
        const clientRes = await resend.emails.send({
          from,
          to: clientTo,
          subject: isTestMode ? `[TEST] ${subject}` : subject,
          react: OrderConfirmationClient({
            locale,
            orderNumber: order.order_number,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            items: clientItems,
            subtotalRon: order.subtotal_ron,
            shippingCostRon: order.shipping_cost_ron,
            totalRon: order.total_ron,
            shipping,
            orderUrl,
            siteOrigin: origin,
            testMode: isTestMode,
            intendedRecipient,
          }),
        });
        if (clientRes.error) {
          console.error('[order-emails] client email failed:', clientRes.error);
        }
      } catch (err) {
        console.error('[order-emails] client email exception:', err);
      }
      if (isTestMode) {
        console.warn(
          `[order-emails] TEST MODE: client confirmation for ${order.order_number} redirected to founder (would be ${intendedRecipient}). Pre-launch: verify ${LEGAL_INFO.brandDomain} in Resend.`,
        );
      }
    }
  } catch (err) {
    // Absolute backstop — order emails must never break the order flow.
    console.error('[order-emails] unexpected failure:', err);
  }
}
