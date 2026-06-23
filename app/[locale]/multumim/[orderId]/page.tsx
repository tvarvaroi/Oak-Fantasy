import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isLocale, type Locale } from '@/lib/i18n-routes';
import { fetchOrderConfirmation } from '@/lib/orders/get-order';
import { ORDER_CONFIRM_CONTENT } from '@/components/order/content';
import MultumimContent, { type ConfirmItem, type ConfirmOrder } from '@/components/order/MultumimContent';

// /multumim/[orderId] (RO) · /thank-you/[orderId] (EN). Order confirmation.
// force-dynamic: status reflects webhook updates; noindex.

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  return {
    title: `${ORDER_CONFIRM_CONTENT[params.locale].title} — Oak Fantasy`,
    robots: { index: false, follow: false },
  };
}

export default async function ThankYouPage({ params }: { params: { locale: string; orderId: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const result = await fetchOrderConfirmation(params.orderId);
  if (!result) notFound();
  const { order, items } = result;

  const sa = (order.shipping_address ?? null) as null | {
    recipient_name?: string;
    street?: string;
    city?: string;
    county?: string;
    postal_code?: string;
    phone?: string;
  };

  const confirmOrder: ConfirmOrder = {
    orderId: order.id,
    orderNumber: order.order_number,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    totalRon: order.total_ron,
    shipping: sa
      ? {
          recipientName: sa.recipient_name ?? '',
          street: sa.street ?? '',
          city: sa.city ?? '',
          county: sa.county ?? '',
          postalCode: sa.postal_code ?? '',
          phone: sa.phone ?? '',
        }
      : null,
  };

  const confirmItems: ConfirmItem[] = items.map((it) => {
    const snap = (it.product_snapshot ?? {}) as { name_ro?: string; name_en?: string };
    return {
      nameRo: snap.name_ro ?? '',
      nameEn: snap.name_en ?? '',
      quantity: it.quantity,
      lineTotalRon: it.line_total_ron,
      engravingText: it.engraving_text,
    };
  });

  return <MultumimContent locale={locale} order={confirmOrder} items={confirmItems} />;
}
