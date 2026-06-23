import type { Locale } from '@/lib/i18n-routes';

// Bilingual labels for cart UI (drawer, /cos page, add-to-cart panel).

export interface CartContent {
  cartAria: string;
  title: string;
  empty: string;
  emptyCta: string;
  subtotal: string;
  shippingNote: string;
  viewCart: string;
  checkout: string;
  checkoutComingSoon: string;
  remove: string;
  close: string;
  quantity: string;
  engraving: string;
  priceUnit: string;
  // add-to-cart panel
  addToCart: string;
  engravingToggle: string;
  engravingPlaceholder: string;
}

export const CART_CONTENT: Record<Locale, CartContent> = {
  ro: {
    cartAria: 'Coș de cumpărături',
    title: 'Coșul tău',
    empty: 'Coșul tău e gol.',
    emptyCta: 'Vezi tocătoarele',
    subtotal: 'Subtotal',
    shippingNote: 'Transportul se calculează la finalizarea comenzii.',
    viewCart: 'Vezi coșul',
    checkout: 'Finalizează comanda',
    checkoutComingSoon: 'Finalizarea comenzii vine în curând.',
    remove: 'Elimină',
    close: 'Închide',
    quantity: 'Cantitate',
    engraving: 'Gravare',
    priceUnit: 'RON',
    addToCart: 'Adaugă în coș',
    engravingToggle: 'Adaugă gravare personalizată',
    engravingPlaceholder: 'Textul gravării (ex: un nume, o dată)',
  },
  en: {
    cartAria: 'Shopping cart',
    title: 'Your cart',
    empty: 'Your cart is empty.',
    emptyCta: 'Browse cutting boards',
    subtotal: 'Subtotal',
    shippingNote: 'Shipping is calculated at checkout.',
    viewCart: 'View cart',
    checkout: 'Checkout',
    checkoutComingSoon: 'Checkout is coming soon.',
    remove: 'Remove',
    close: 'Close',
    quantity: 'Quantity',
    engraving: 'Engraving',
    priceUnit: 'RON',
    addToCart: 'Add to cart',
    engravingToggle: 'Add custom engraving',
    engravingPlaceholder: 'Engraving text (e.g. a name, a date)',
  },
};
