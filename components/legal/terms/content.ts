import type { Locale } from '@/lib/i18n-routes';

import type { LegalContent } from '../content';

const COMMON_LAST_UPDATED = '[ULTIMA_ACTUALIZARE]';

export const TERMS_CONTENT: Record<Locale, LegalContent> = {
  ro: {
    meta: {
      title: 'Termeni și condiții — Oak Fantasy',
      description:
        'Termeni și condiții ai magazinului Oak Fantasy. Comandă, livrare, retragere, garanție, soluționare dispute.',
    },
    hero: {
      eyebrow: 'Termeni și condiții',
      title: 'Termeni și condiții',
      lastUpdated: COMMON_LAST_UPDATED,
      lastUpdatedLabel: 'Ultima actualizare',
    },
    banner: {
      eyebrow: 'Acest document este în pregătire',
      bodyTemplate:
        'Conținutul juridic final va fi disponibil înainte de lansarea publică oficială. Pentru întrebări, ne poți scrie la {contactEmail}.',
    },
    sections: [
      { id: 'parties', title: 'Părți contractante' },
      { id: 'definitions', title: 'Definiții' },
      { id: 'subject-of-contract', title: 'Obiectul contractului' },
      { id: 'ordering', title: 'Comandarea produselor' },
      { id: 'prices-payment', title: 'Prețuri și modalități de plată' },
      { id: 'delivery', title: 'Livrarea produselor' },
      { id: 'right-of-withdrawal', title: 'Dreptul la retragere' },
      { id: 'warranty', title: 'Garanție produse' },
      { id: 'liability-force-majeure', title: 'Răspundere și forță majoră' },
      { id: 'dispute-resolution', title: 'Soluționare dispute' },
      { id: 'personal-data-protection', title: 'Protecția datelor cu caracter personal' },
      { id: 'amendments', title: 'Modificarea termenilor' },
      { id: 'acceptance', title: 'Acceptarea termenilor' },
      { id: 'contact-info', title: 'Contact și informații companie' },
    ],
    companyInfo: {
      sectionLabel: 'Datele operatorului',
      labels: {
        operator: 'Operator',
        cui: 'CUI',
        regCom: 'Reg. Com.',
        sediu: 'Sediu social',
        contact: 'Contact',
      },
      placeholderBanner:
        'Datele firmei vor fi actualizate înainte de lansare.',
    },
  },
  en: {
    meta: {
      title: 'Terms and Conditions — Oak Fantasy',
      description:
        'Oak Fantasy shop terms and conditions. Ordering, delivery, withdrawal, warranty, dispute resolution.',
    },
    hero: {
      eyebrow: 'Terms and conditions',
      title: 'Terms and conditions',
      lastUpdated: COMMON_LAST_UPDATED,
      lastUpdatedLabel: 'Last updated',
    },
    banner: {
      eyebrow: 'This document is in preparation',
      bodyTemplate:
        'The final legal content will be available before the official public launch. For questions, you can write to us at {contactEmail}.',
    },
    sections: [
      { id: 'parties', title: 'Contracting parties' },
      { id: 'definitions', title: 'Definitions' },
      { id: 'subject-of-contract', title: 'Subject of the contract' },
      { id: 'ordering', title: 'Ordering products' },
      { id: 'prices-payment', title: 'Prices and payment methods' },
      { id: 'delivery', title: 'Delivery of products' },
      { id: 'right-of-withdrawal', title: 'Right of withdrawal' },
      { id: 'warranty', title: 'Product warranty' },
      { id: 'liability-force-majeure', title: 'Liability and force majeure' },
      { id: 'dispute-resolution', title: 'Dispute resolution' },
      { id: 'personal-data-protection', title: 'Personal data protection' },
      { id: 'amendments', title: 'Amendments to the terms' },
      { id: 'acceptance', title: 'Acceptance of the terms' },
      { id: 'contact-info', title: 'Contact and company information' },
    ],
    companyInfo: {
      sectionLabel: 'Operator details',
      labels: {
        operator: 'Operator',
        cui: 'VAT ID',
        regCom: 'Reg. Com.',
        sediu: 'Registered office',
        contact: 'Contact',
      },
      placeholderBanner:
        'Company details will be updated before launch.',
    },
  },
};
