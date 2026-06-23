import type { Locale } from '@/lib/i18n-routes';

export interface CheckoutContent {
  pageTitle: string;
  steps: { shipping: string; payment: string; review: string };
  back: string;
  continue: string;
  priceUnit: string;

  // Step 1
  shippingHeading: string;
  loginPrompt: string;
  loginLink: string;
  orderingAsPrefix: string;
  email: string;
  fullName: string;
  phone: string;
  phonePlaceholder: string;
  street: string;
  streetPlaceholder: string;
  city: string;
  county: string;
  countyPlaceholder: string;
  postalCode: string;
  notes: string;
  notesPlaceholder: string;
  optional: string;

  // Step 2
  paymentHeading: string;
  cardLabel: string;
  cardNote: string;
  codLabel: string;
  codNote: string;
  shippingCostLabel: string;
  freeShipping: string;
  freeShippingHint: string;
  leadTime: string;

  // Step 3
  reviewHeading: string;
  shippingToLabel: string;
  paymentLabel: string;
  subtotal: string;
  total: string;
  termsPrefix: string;
  termsLink: string;
  placeOrder: string;
  placeOrderComingSoon: string;
  placing: string;
  engraving: string;
  errors: { generic: string; unavailable: string; outOfStock: string; paymentUnavailable: string };
}

export const CHECKOUT_CONTENT: Record<Locale, CheckoutContent> = {
  ro: {
    pageTitle: 'Finalizare comandă',
    steps: { shipping: 'Livrare', payment: 'Plată', review: 'Rezumat' },
    back: 'Înapoi',
    continue: 'Continuă',
    priceUnit: 'RON',

    shippingHeading: 'Date de livrare',
    loginPrompt: 'Ai deja cont?',
    loginLink: 'Conectează-te',
    orderingAsPrefix: 'Comanzi ca',
    email: 'Email',
    fullName: 'Nume complet',
    phone: 'Telefon',
    phonePlaceholder: '0712 345 678',
    street: 'Stradă și număr',
    streetPlaceholder: 'Str. Stejarului nr. 12, bl. A, ap. 3',
    city: 'Oraș / Localitate',
    county: 'Județ',
    countyPlaceholder: 'Alege județul',
    postalCode: 'Cod poștal',
    notes: 'Observații',
    notesPlaceholder: 'Ex: sunați înainte de livrare',
    optional: 'opțional',

    paymentHeading: 'Metodă de plată',
    cardLabel: 'Card bancar',
    cardNote: 'Plată securizată cu cardul.',
    codLabel: 'Ramburs (plata la livrare)',
    codNote: 'Plătești curierului la primire.',
    shippingCostLabel: 'Transport',
    freeShipping: 'Gratuit',
    freeShippingHint: 'Transport gratuit peste 500 RON.',
    leadTime: 'Livrare estimată în 5–10 zile lucrătoare.',

    reviewHeading: 'Rezumat comandă',
    shippingToLabel: 'Livrare către',
    paymentLabel: 'Plată',
    subtotal: 'Subtotal',
    total: 'Total',
    termsPrefix: 'Sunt de acord cu',
    termsLink: 'termenii și condițiile',
    placeOrder: 'Plasează comanda',
    placeOrderComingSoon: 'Plata vine în curând — o activăm în pasul următor.',
    placing: 'Se procesează…',
    engraving: 'Gravare',
    errors: {
      generic: 'Ceva nu a mers. Te rugăm încearcă din nou.',
      unavailable: 'Un produs din coș nu mai este disponibil.',
      outOfStock: 'Un produs nu mai este în stoc în cantitatea cerută.',
      paymentUnavailable: 'Plata cu cardul nu este disponibilă momentan. Încearcă ramburs.',
    },
  },
  en: {
    pageTitle: 'Checkout',
    steps: { shipping: 'Shipping', payment: 'Payment', review: 'Review' },
    back: 'Back',
    continue: 'Continue',
    priceUnit: 'RON',

    shippingHeading: 'Shipping details',
    loginPrompt: 'Already have an account?',
    loginLink: 'Sign in',
    orderingAsPrefix: 'Ordering as',
    email: 'Email',
    fullName: 'Full name',
    phone: 'Phone',
    phonePlaceholder: '0712 345 678',
    street: 'Street and number',
    streetPlaceholder: '12 Oak Street, building A, apt. 3',
    city: 'City / Town',
    county: 'County',
    countyPlaceholder: 'Select county',
    postalCode: 'Postal code',
    notes: 'Notes',
    notesPlaceholder: 'E.g. call before delivery',
    optional: 'optional',

    paymentHeading: 'Payment method',
    cardLabel: 'Card',
    cardNote: 'Secure card payment.',
    codLabel: 'Cash on delivery',
    codNote: 'Pay the courier on arrival.',
    shippingCostLabel: 'Shipping',
    freeShipping: 'Free',
    freeShippingHint: 'Free shipping over 500 RON.',
    leadTime: 'Estimated delivery in 5–10 business days.',

    reviewHeading: 'Order summary',
    shippingToLabel: 'Shipping to',
    paymentLabel: 'Payment',
    subtotal: 'Subtotal',
    total: 'Total',
    termsPrefix: 'I agree to the',
    termsLink: 'terms and conditions',
    placeOrder: 'Place order',
    placeOrderComingSoon: 'Payment is coming soon — we enable it in the next step.',
    placing: 'Processing…',
    engraving: 'Engraving',
    errors: {
      generic: 'Something went wrong. Please try again.',
      unavailable: 'A product in your cart is no longer available.',
      outOfStock: 'A product is no longer in stock in the requested quantity.',
      paymentUnavailable: 'Card payment is unavailable right now. Try cash on delivery.',
    },
  },
};
