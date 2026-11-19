// 404 copy (2026-11-19). One language per page: the locale comes from the URL
// (/ro/... or /en/...). The root fallback (no locale in the path) uses RO and
// offers the English home as a separate link.
import type { Locale } from '@/lib/i18n-routes';

export interface NotFoundContent {
  label: string;
  title: string;
  body: string;
  home: string;
  catalog: string;
}

export const NOT_FOUND_CONTENT: Record<Locale, NotFoundContent> = {
  ro: {
    label: 'Eroare 404',
    title: 'Pagina asta nu există.',
    body: 'Poate s-a mutat sau adresa are o greșeală. Tocătoarele sunt la locul lor, în catalog.',
    home: 'Înapoi acasă',
    catalog: 'Vezi tocătoarele',
  },
  en: {
    label: 'Error 404',
    title: 'This page does not exist.',
    body: 'It may have moved, or the address has a typo. The cutting boards are where they belong, in the catalog.',
    home: 'Back to home',
    catalog: 'See the cutting boards',
  },
};

/** Root fallback (no locale in the URL): link to the English home, lang="en". */
export const ROOT_ENGLISH_LINK = 'English version';
