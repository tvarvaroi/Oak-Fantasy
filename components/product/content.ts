import type { Locale } from '@/lib/i18n-routes';

// Bilingual labels for the product detail page (Task 3.1). Tier labels reuse
// the catalog's tierDisplay to stay consistent. Page is under [locale], so EN
// is mandatory (check:i18n).

export interface ProductDetailContent {
  breadcrumbHome: string;
  breadcrumbCatalog: string;
  dimensions: string;
  weight: string;
  engravingTitle: string;
  engravingNote: string;
  // Keep in sync with lib/config/shipping.ts (25 RON flat / free from 500 RON,
  // i.e. subtotal >= threshold — say "de la" / "from", never "peste" / "over").
  shippingNote: string;
  addToCart: string;
  cartComingSoon: string;
  saleLabel: string;
  detailsHeading: string;
  priceUnit: string;
  photoBadge: string;
  backToCatalog: string;
  galleryThumbAria: string;
  /** Orderable (ready-made or made to order). Not a promise the piece is already made. */
  inStock: string;
  /** Shown under the availability badge: max time to dispatch (2026-11-19). */
  leadTime: string;
  outOfStock: string;
  outOfStockNote: string;
  /** "Livrare, plată și retur" block (components/product/BuyingInfo.tsx). */
  buyingInfo: BuyingInfoContent;
}

// Plain-words summary of the Terms (§6 payment, §7 delivery, §8 withdrawal) and
// of the /retur "Pe scurt" callouts. NO figure is written here: {fee}, {free},
// {dispatch}, {transit} and {returnDays} are filled by BuyingInfo from
// lib/config/shipping.ts and lib/config/returns.ts — the same sources as the
// checkout total, the Terms and the Product JSON-LD. Do not add a claim that is
// not already in components/legal/{terms,returns}/content.ts.
export interface BuyingInfoContent {
  title: string;
  paymentLabel: string;
  payment: string;
  deliveryLabel: string;
  delivery: string;
  timingLabel: string;
  timing: string;
  returnsLabel: string;
  returns: string;
  /** Link labels: the full policy pages. */
  moreReturns: string;
  moreTerms: string;
}

export const PRODUCT_DETAIL_CONTENT: Record<Locale, ProductDetailContent> = {
  ro: {
    breadcrumbHome: 'Acasă',
    breadcrumbCatalog: 'Tocătoare',
    dimensions: 'Dimensiuni',
    weight: 'Greutate',
    engravingTitle: 'Gravare personalizată',
    engravingNote: 'Disponibilă la cerere — o adaugi la finalizarea comenzii.',
    shippingNote: 'Livrare doar în România · 25 RON · gratuit de la 500 RON',
    addToCart: 'Adaugă în coș',
    cartComingSoon: 'Coșul de cumpărături vine în curând.',
    saleLabel: 'Reducere',
    detailsHeading: 'Despre acest produs',
    priceUnit: 'RON',
    photoBadge: 'Foto în pregătire',
    backToCatalog: 'Înapoi la tocătoare',
    galleryThumbAria: 'Vezi imaginea',
    inStock: 'Disponibil',
    leadTime: 'Unele piese sunt gata făcute, altele le lucrăm după comandă. Expediem în cel mult 5–10 zile lucrătoare.',
    outOfStock: 'Stoc epuizat',
    outOfStockNote: 'Acest produs s-a epuizat. Scrie-ne dacă vrei să-l refacem.',
    buyingInfo: {
      title: 'Livrare, plată și retur',
      paymentLabel: 'Plată',
      payment: 'Plătești ramburs: în numerar, curierului, când primești coletul. Deocamdată nu acceptăm plata cu cardul.',
      deliveryLabel: 'Livrare',
      delivery: 'Livrăm doar în România, prin curier. Transportul costă {fee}; pentru comenzile de la {free} în sus e gratuit.',
      timingLabel: 'Termen',
      timing: 'Expediem comanda în cel mult {dispatch} zile lucrătoare de la confirmare. Apoi curierul o livrează de regulă în {transit} zile lucrătoare.',
      returnsLabel: 'Retur',
      returns: 'Un produs standard îl poți returna în {returnDays} zile de la primire, fără să ne spui de ce. Transportul de retur îl plătești tu. Produsele gravate și lucrările la comandă sunt făcute pentru tine, așa că nu le putem primi înapoi doar pentru că te-ai răzgândit.',
      moreReturns: 'Politica de retur',
      moreTerms: 'Termeni și condiții',
    },
  },
  en: {
    breadcrumbHome: 'Home',
    breadcrumbCatalog: 'Cutting boards',
    dimensions: 'Dimensions',
    weight: 'Weight',
    engravingTitle: 'Custom engraving',
    engravingNote: 'Available on request — add it at checkout.',
    shippingNote: 'Ships only within Romania · 25 RON · free from 500 RON',
    addToCart: 'Add to cart',
    cartComingSoon: 'The shopping cart is coming soon.',
    saleLabel: 'Sale',
    detailsHeading: 'About this board',
    priceUnit: 'RON',
    photoBadge: 'Photo coming soon',
    backToCatalog: 'Back to cutting boards',
    galleryThumbAria: 'View image',
    inStock: 'Available',
    leadTime: 'Some pieces are ready-made, others we make once you order. We ship within 5–10 business days at the latest.',
    outOfStock: 'Out of stock',
    outOfStockNote: 'This piece is sold out. Write to us if you’d like us to make it again.',
    buyingInfo: {
      title: 'Delivery, payment and returns',
      paymentLabel: 'Payment',
      payment: 'You pay cash on delivery: in cash, to the courier, when the parcel arrives. For now we do not accept card payments.',
      deliveryLabel: 'Delivery',
      delivery: 'We deliver only within Romania, by courier. Delivery costs {fee}; orders of {free} or more ship free.',
      timingLabel: 'Timing',
      timing: 'We ship your order within {dispatch} business days of confirmation at the latest. The courier then usually delivers it in {transit} business days.',
      returnsLabel: 'Returns',
      returns: 'You can return a standard product within {returnDays} days of receiving it, without telling us why. You pay for the return shipping. Engraved products and custom work are made for you, so we cannot take them back just because you changed your mind.',
      moreReturns: 'Returns policy',
      moreTerms: 'Terms and conditions',
    },
  },
};
