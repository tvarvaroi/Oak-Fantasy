import type { Locale } from '@/lib/i18n-routes';

export interface OrderConfirmContent {
  title: string;
  intro: string;
  orderNumberLabel: string;
  statusPaid: string;
  statusPendingPayment: string;
  statusCod: string;
  itemsHeading: string;
  shippingToHeading: string;
  totalLabel: string;
  priceUnit: string;
  engraving: string;
  quantityLabel: string;
  continueShopping: string;
}

export const ORDER_CONFIRM_CONTENT: Record<Locale, OrderConfirmContent> = {
  ro: {
    title: 'Mulțumim pentru comandă!',
    intro: 'Am primit comanda ta. Te sunăm sau îți scriem pe WhatsApp, la numărul din comandă, ca s-o confirmăm.',
    orderNumberLabel: 'Număr comandă',
    statusPaid: 'Plata a fost confirmată.',
    statusPendingPayment: 'Confirmăm plata — vei primi un email când e gata.',
    statusCod: 'Plătești la livrare (ramburs), curierului.',
    itemsHeading: 'Produse',
    shippingToHeading: 'Livrare către',
    totalLabel: 'Total',
    priceUnit: 'RON',
    engraving: 'Gravare',
    quantityLabel: 'Cantitate',
    continueShopping: 'Vezi tocătoarele',
  },
  en: {
    title: 'Thank you for your order!',
    intro: 'We have received your order. We will call you or message you on WhatsApp, at the number in the order, to confirm it.',
    orderNumberLabel: 'Order number',
    statusPaid: 'Your payment is confirmed.',
    statusPendingPayment: "We're confirming your payment — you'll get an email shortly.",
    statusCod: 'You will pay the courier on delivery (cash on delivery).',
    itemsHeading: 'Items',
    shippingToHeading: 'Shipping to',
    totalLabel: 'Total',
    priceUnit: 'RON',
    engraving: 'Engraving',
    quantityLabel: 'Quantity',
    continueShopping: 'Browse cutting boards',
  },
};
