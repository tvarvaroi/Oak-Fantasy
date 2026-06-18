import type { Locale } from '@/lib/i18n-routes';

import type { LegalContent } from '../content';

const COMMON_LAST_UPDATED = '[ULTIMA_ACTUALIZARE]';

// Statutory citations rendered inside specific sections via the
// page-level `sectionOverrides` mechanism. We keep them here in the
// content map (locale-aware) rather than hard-coding inside the page.
export const RETURNS_STATUTORY = {
  ro: {
    exceptions: {
      eyebrow: 'Notă legală',
      citation: 'OUG 34/2014, art. 16, lit. c',
      body:
        'Conform dispozițiilor legale, dreptul la retragere NU se aplică produselor confecționate după specificațiile consumatorului (de exemplu, tocătoarele cu gravare personalizată). Detaliile complete vor fi formulate de un avocat înainte de lansare.',
    },
  },
  en: {
    exceptions: {
      eyebrow: 'Statutory note',
      citation: 'Romanian Government Ordinance 34/2014, art. 16, lit. c',
      body:
        'Under Romanian consumer law, the right of withdrawal does NOT apply to goods made to the consumer’s specifications (for example, personalised engraved cutting boards). Full wording will be finalised by a lawyer before launch.',
    },
  },
} as const;

export const RETURNS_CONTENT: Record<Locale, LegalContent> = {
  ro: {
    meta: {
      title: 'Politica de retur — Oak Fantasy',
      description:
        'Politica Oak Fantasy de retur și retragere — termen 14 zile, excepții pentru produse personalizate, procedură, rambursare.',
    },
    hero: {
      eyebrow: 'Politică de retur',
      title: 'Politica de retur',
      lastUpdated: COMMON_LAST_UPDATED,
      lastUpdatedLabel: 'Ultima actualizare',
    },
    banner: {
      eyebrow: 'Acest document este în pregătire',
      bodyTemplate:
        'Conținutul juridic final va fi disponibil înainte de lansarea publică oficială. Pentru întrebări, ne poți scrie la {contactEmail}.',
    },
    sections: [
      { id: 'right-of-withdrawal', title: 'Dreptul la retragere — 14 zile' },
      { id: 'time-calculation', title: 'Calculul termenului de retragere' },
      { id: 'exceptions', title: 'Excepții — produse personalizate / gravate' },
      { id: 'procedure', title: 'Procedura returnării' },
      { id: 'product-condition', title: 'Starea produsului la retur' },
      { id: 'return-cost', title: 'Cost returnare' },
      { id: 'refund', title: 'Rambursarea sumelor' },
      { id: 'defective', title: 'Produse defecte sau neconforme' },
      { id: 'withdrawal-form', title: 'Formularul de retragere' },
      { id: 'anpc-sal-sol', title: 'ANPC și soluționarea alternativă' },
    ],
    companyInfo: {
      sectionLabel: 'Datele operatorului',
      labels: {
        operator: 'Operator',
        cui: 'CUI',
        regCom: 'Reg. Com.',
        sediu: 'Sediu social',
        contact: 'Contact retur',
      },
      placeholderBanner:
        'Datele firmei vor fi actualizate înainte de lansare.',
    },
  },
  en: {
    meta: {
      title: 'Returns Policy — Oak Fantasy',
      description:
        'Oak Fantasy returns and withdrawal policy — 14-day window, exceptions for personalised goods, procedure, refunds.',
    },
    hero: {
      eyebrow: 'Returns policy',
      title: 'Returns policy',
      lastUpdated: COMMON_LAST_UPDATED,
      lastUpdatedLabel: 'Last updated',
    },
    banner: {
      eyebrow: 'This document is in preparation',
      bodyTemplate:
        'The final legal content will be available before the official public launch. For questions, you can write to us at {contactEmail}.',
    },
    sections: [
      { id: 'right-of-withdrawal', title: 'Right of withdrawal — 14 days' },
      { id: 'time-calculation', title: 'Calculating the withdrawal period' },
      {
        id: 'exceptions',
        title: 'Exceptions — personalised / engraved products',
      },
      { id: 'procedure', title: 'Return procedure' },
      { id: 'product-condition', title: 'Product condition at return' },
      { id: 'return-cost', title: 'Return cost' },
      { id: 'refund', title: 'Refund of amounts' },
      { id: 'defective', title: 'Defective or non-conforming products' },
      { id: 'withdrawal-form', title: 'Withdrawal form' },
      {
        id: 'anpc-sal-sol',
        title: 'ANPC and alternative dispute resolution',
      },
    ],
    companyInfo: {
      sectionLabel: 'Operator details',
      labels: {
        operator: 'Operator',
        cui: 'VAT ID',
        regCom: 'Reg. Com.',
        sediu: 'Registered office',
        contact: 'Returns contact',
      },
      placeholderBanner:
        'Company details will be updated before launch.',
    },
  },
};
