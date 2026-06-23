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
  addToCart: string;
  cartComingSoon: string;
  saleLabel: string;
  detailsHeading: string;
  priceUnit: string;
  photoBadge: string;
  backToCatalog: string;
  galleryThumbAria: string;
}

export const PRODUCT_DETAIL_CONTENT: Record<Locale, ProductDetailContent> = {
  ro: {
    breadcrumbHome: 'Acasă',
    breadcrumbCatalog: 'Tocătoare',
    dimensions: 'Dimensiuni',
    weight: 'Greutate',
    engravingTitle: 'Gravare personalizată',
    engravingNote: 'Disponibilă la cerere — o adaugi la finalizarea comenzii.',
    addToCart: 'Adaugă în coș',
    cartComingSoon: 'Coșul de cumpărături vine în curând.',
    saleLabel: 'Reducere',
    detailsHeading: 'Despre acest produs',
    priceUnit: 'RON',
    photoBadge: 'Foto în pregătire',
    backToCatalog: 'Înapoi la tocătoare',
    galleryThumbAria: 'Vezi imaginea',
  },
  en: {
    breadcrumbHome: 'Home',
    breadcrumbCatalog: 'Cutting boards',
    dimensions: 'Dimensions',
    weight: 'Weight',
    engravingTitle: 'Custom engraving',
    engravingNote: 'Available on request — add it at checkout.',
    addToCart: 'Add to cart',
    cartComingSoon: 'The shopping cart is coming soon.',
    saleLabel: 'Sale',
    detailsHeading: 'About this board',
    priceUnit: 'RON',
    photoBadge: 'Photo coming soon',
    backToCatalog: 'Back to cutting boards',
    galleryThumbAria: 'View image',
  },
};
