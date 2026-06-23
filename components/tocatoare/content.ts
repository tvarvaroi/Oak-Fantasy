import type { Locale } from '@/lib/i18n-routes';

export type Tier = 'entry' | 'core' | 'premium' | 'hero';

export interface TocatoareContent {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  hero: {
    eyebrow: string;
    titleStart: string;
    titleEm: string;
    sub: string;
    note: { strong: string; rest: string };
  };
  filters: { all: string; entry: string; core: string; premium: string; hero: string };
  sort: {
    button: string;
    options: { default: string; priceAsc: string; priceDesc: string };
  };
  card: {
    photoBadge: string;
    seeDetails: string;
    quickAddAria: string;
    priceUnit: string;
    outOfStock: string;
  };
  tierDisplay: Record<Tier, string>;
  emptyState: { heading: string; body: string };
  bottomCta: { heading: string; body: string; button: string; email: string };
}

// RO copy is verbatim from the Claude Design brief (chat1.md). EN is translated
// following CLAUDE.md voice rules: collective "we", concrete > abstract, no
// "premium"/"luxury"/"exclusive" loanwords, no emoji.
export const TOCATOARE_CONTENT: Record<Locale, TocatoareContent> = {
  ro: {
    meta: {
      title: 'Tocătoarele noastre — Oak Fantasy',
      description:
        'Zece modele de tocătoare din stejar de Carpați, lucrate manual. De la tocătorul de zi cu zi până la blocul de moștenire.',
      ogTitle: 'Tocătoarele noastre — Oak Fantasy',
      ogDescription:
        'Catalog complet: zece modele lucrate manual din stejar românesc, de la 180 la 1.800 RON.',
    },
    hero: {
      eyebrow: 'Catalog · Toate modelele',
      titleStart: 'Tocătoarele',
      titleEm: 'noastre.',
      sub: 'Zece modele, de la tocătorul de zi cu zi până la blocul de moștenire. Fiecare lucrat manual din stejar de Carpați.',
      note: {
        strong: 'Lansăm în octombrie.',
        rest: 'Înscrie-te pe listă și ești primul care află când deschidem comenzile.',
      },
    },
    filters: {
      all: 'Toate',
      entry: 'Pentru început',
      core: 'Esențiale',
      premium: 'Deosebite',
      hero: 'Moștenire',
    },
    sort: {
      button: 'Sortează',
      options: {
        default: 'Implicit',
        priceAsc: 'Sortează: Preț crescător',
        priceDesc: 'Sortează: Preț descrescător',
      },
    },
    card: {
      photoBadge: 'Foto în pregătire',
      seeDetails: 'Vezi detalii',
      quickAddAria: 'Adaugă în coș',
      priceUnit: 'RON',
      outOfStock: 'Stoc epuizat',
    },
    tierDisplay: {
      entry: 'Pentru început',
      core: 'Esențiale',
      premium: 'Deosebite',
      hero: 'Moștenire',
    },
    emptyState: {
      heading: 'Pădurea e liniștită aici.',
      body: 'Niciun produs în această categorie momentan. Revino curând — adăugăm modele noi.',
    },
    bottomCta: {
      heading: 'Nu te poți hotărî?',
      body: 'Scrie-ne și te ajutăm să alegi tocătorul potrivit pentru bucătăria ta.',
      button: 'Contactează-ne',
      email: 'atelier@oakfantasy.ro',
    },
  },
  en: {
    meta: {
      title: 'Our cutting boards — Oak Fantasy',
      description:
        'Ten models of Carpathian oak cutting boards, handcrafted. From the everyday board to the heirloom block.',
      ogTitle: 'Our cutting boards — Oak Fantasy',
      ogDescription:
        'Full catalogue: ten handcrafted Romanian oak boards, from 180 to 1,800 RON.',
    },
    hero: {
      eyebrow: 'Catalogue · All models',
      titleStart: 'Our',
      titleEm: 'boards.',
      sub: 'Ten models, from the everyday board to the heirloom block. Each handcrafted from Carpathian oak.',
      note: {
        strong: 'Launching in October.',
        rest: 'Join the list and be the first to know when orders open.',
      },
    },
    filters: {
      all: 'All',
      entry: 'Starters',
      core: 'Essentials',
      premium: 'Standouts',
      hero: 'Heirloom',
    },
    sort: {
      button: 'Sort',
      options: {
        default: 'Default',
        priceAsc: 'Sort: Price low to high',
        priceDesc: 'Sort: Price high to low',
      },
    },
    card: {
      photoBadge: 'Photo coming soon',
      seeDetails: 'See details',
      quickAddAria: 'Add to cart',
      priceUnit: 'RON',
      outOfStock: 'Out of stock',
    },
    tierDisplay: {
      entry: 'Starters',
      core: 'Essentials',
      premium: 'Standouts',
      hero: 'Heirloom',
    },
    emptyState: {
      heading: 'The forest is quiet here.',
      body: 'No products in this category yet. Come back soon — new models are on the way.',
    },
    bottomCta: {
      heading: "Can't decide?",
      body: "Write to us and we'll help you choose the right board for your kitchen.",
      button: 'Get in touch',
      email: 'atelier@oakfantasy.ro',
    },
  },
};

// Format price in bani (e.g. 18000) as locale-appropriate RON string ("180" / "1.500" / "1,500").
export function formatPriceRon(priceBani: number, locale: Locale): string {
  const ron = Math.round(priceBani / 100);
  const sep = locale === 'ro' ? '.' : ',';
  return ron.toLocaleString(locale === 'ro' ? 'de-DE' : 'en-US').replace(/[.,]/g, sep);
}

// Format dimensions jsonb. Rect: "25 × 18 × 2 cm"; round: "Ø 32 × 2,5 cm" (RO comma decimal).
type Dims =
  | { length?: number; width?: number; thickness?: number; unit?: string }
  | { diameter?: number; thickness?: number; unit?: string; shape?: string }
  | null
  | undefined;

export function formatDimensions(dims: unknown, locale: Locale): string {
  if (!dims || typeof dims !== 'object') return '';
  const d = dims as Dims;
  const decimal = locale === 'ro' ? ',' : '.';
  const fmt = (n: number) => n.toString().replace('.', decimal);
  const unit = (d as { unit?: string })?.unit ?? 'cm';
  if (d && 'diameter' in d && d.diameter != null && d.thickness != null) {
    return `Ø ${fmt(d.diameter)} × ${fmt(d.thickness)} ${unit}`;
  }
  if (
    d &&
    'length' in d &&
    d.length != null &&
    d.width != null &&
    d.thickness != null
  ) {
    return `${fmt(d.length)} × ${fmt(d.width)} × ${fmt(d.thickness)} ${unit}`;
  }
  return '';
}
