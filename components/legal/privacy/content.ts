import type { Locale } from '@/lib/i18n-routes';

import type { LegalContent } from '../content';

const COMMON_LAST_UPDATED = '[ULTIMA_ACTUALIZARE]';

export const PRIVACY_CONTENT: Record<Locale, LegalContent> = {
  ro: {
    meta: {
      title: 'Politica de confidențialitate — Oak Fantasy',
      description:
        'Politica Oak Fantasy privind prelucrarea datelor cu caracter personal — GDPR, drepturi, sub-procesatori, securitate.',
    },
    hero: {
      eyebrow: 'Confidențialitate',
      title: 'Politica de confidențialitate',
      lastUpdated: COMMON_LAST_UPDATED,
      lastUpdatedLabel: 'Ultima actualizare',
    },
    banner: {
      eyebrow: 'Acest document este în pregătire',
      bodyTemplate:
        'Conținutul juridic final va fi disponibil înainte de lansarea publică oficială. Pentru întrebări, ne poți scrie la {contactEmail}.',
    },
    sections: [
      { id: 'data-controller', title: 'Operatorul de date' },
      { id: 'dpo', title: 'Responsabilul cu protecția datelor' },
      { id: 'data-types', title: 'Tipuri de date colectate' },
      { id: 'processing-purposes', title: 'Scopurile prelucrării' },
      { id: 'legal-basis', title: 'Temeiul legal al prelucrării' },
      { id: 'recipients', title: 'Destinatari și sub-procesatori' },
      { id: 'international-transfer', title: 'Transfer date internaționale' },
      { id: 'retention', title: 'Perioada de retenție' },
      { id: 'data-subject-rights', title: 'Drepturile persoanei vizate' },
      { id: 'cookies', title: 'Cookies și tehnologii similare' },
      { id: 'security', title: 'Securitatea datelor' },
      { id: 'changes', title: 'Modificări ale politicii' },
      { id: 'gdpr-contact', title: 'Contact pentru întrebări GDPR' },
      { id: 'complaint-right', title: 'Dreptul de a depune plângere' },
    ],
    companyInfo: {
      sectionLabel: 'Datele operatorului',
      labels: {
        operator: 'Operator',
        cui: 'CUI',
        regCom: 'Reg. Com.',
        sediu: 'Sediu social',
        contact: 'Contact GDPR',
      },
      placeholderBanner:
        'Datele firmei vor fi actualizate înainte de lansare.',
    },
  },
  en: {
    meta: {
      title: 'Privacy Policy — Oak Fantasy',
      description:
        'Oak Fantasy privacy policy on personal data processing — GDPR rights, sub-processors, security, retention.',
    },
    hero: {
      eyebrow: 'Privacy',
      title: 'Privacy policy',
      lastUpdated: COMMON_LAST_UPDATED,
      lastUpdatedLabel: 'Last updated',
    },
    banner: {
      eyebrow: 'This document is in preparation',
      bodyTemplate:
        'The final legal content will be available before the official public launch. For questions, you can write to us at {contactEmail}.',
    },
    sections: [
      { id: 'data-controller', title: 'Data controller' },
      { id: 'dpo', title: 'Data protection officer' },
      { id: 'data-types', title: 'Types of data collected' },
      { id: 'processing-purposes', title: 'Processing purposes' },
      { id: 'legal-basis', title: 'Legal basis for processing' },
      { id: 'recipients', title: 'Recipients and sub-processors' },
      { id: 'international-transfer', title: 'International data transfers' },
      { id: 'retention', title: 'Retention period' },
      { id: 'data-subject-rights', title: 'Data subject rights' },
      { id: 'cookies', title: 'Cookies and similar technologies' },
      { id: 'security', title: 'Data security' },
      { id: 'changes', title: 'Changes to the policy' },
      { id: 'gdpr-contact', title: 'Contact for GDPR questions' },
      { id: 'complaint-right', title: 'Right to lodge a complaint' },
    ],
    companyInfo: {
      sectionLabel: 'Operator details',
      labels: {
        operator: 'Operator',
        cui: 'VAT ID',
        regCom: 'Reg. Com.',
        sediu: 'Registered office',
        contact: 'GDPR contact',
      },
      placeholderBanner:
        'Company details will be updated before launch.',
    },
  },
};
