import type { Locale } from '@/lib/i18n-routes';

// Bilingual content map for the /contact (RO) / /contact (EN) page.
// Pattern mirrors components/about/content.ts. Keys must stay symmetric
// across ro/en — scripts/check-i18n.mjs enforces parity.

export interface ContactCopy {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    handwritten: string;
    intro: string;
  };
  form: {
    sectionLabel: string;
    fields: {
      name: { label: string; placeholder: string };
      email: { label: string; placeholder: string };
      phone: { label: string; placeholder: string; optional: string };
      subject: { label: string; placeholder: string };
      message: { label: string; placeholder: string; counter: string };
    };
    submit: {
      idle: string;
      loading: string;
      successHeadline: (name: string) => string;
      successBody: string;
      errorGeneric: string;
      errorRate: (minutes: number) => string;
    };
  };
  info: {
    sectionLabel: string;
    emailLabel: string;
    phoneLabel: string;
    workshopLabel: string;
    hoursLabel: string;
    placeholderBanner: string;
    sign: string;
  };
}

export const CONTACT_CONTENT: Record<Locale, ContactCopy> = {
  ro: {
    meta: {
      title: 'Contact — Oak Fantasy',
      description:
        'Scrie-ne despre o comandă, o gravare personalizată sau un proiect B2B. Răspundem în 24 de ore, direct din atelier.',
    },
    hero: {
      eyebrow: 'Vorbește cu noi',
      title: 'Suntem aici, în atelier.',
      handwritten: 'lemn proaspăt, mâini la lucru',
      intro:
        'Întrebări despre un produs, comenzi personalizate, colaborări sau pur și simplu curiozitate — orice mesaj ajunge direct la noi. Răspundem în cel mult 24 de ore (zile lucrătoare).',
    },
    form: {
      sectionLabel: 'Trimite-ne un mesaj',
      fields: {
        name: { label: 'Nume', placeholder: 'cum ne adresăm' },
        email: { label: 'Email', placeholder: 'adresa ta de email' },
        phone: {
          label: 'Telefon',
          placeholder: 'opțional, pentru detalii rapide',
          optional: 'opțional',
        },
        subject: { label: 'Subiect', placeholder: 'alege un subiect' },
        message: {
          label: 'Mesaj',
          placeholder:
            'scrie aici despre ce ai în minte — dimensiuni, dedicație, livrare, întrebări…',
          counter: 'caractere',
        },
      },
      submit: {
        idle: 'Trimite mesajul',
        loading: 'Se trimite…',
        successHeadline: (name) =>
          `Mulțumim, ${name}! Mesajul tău a ajuns în atelier.`,
        successBody:
          'Răspundem în cel mult 24 de ore (zile lucrătoare), direct de la masă.',
        errorGeneric:
          'Ceva nu a mers bine. Te rugăm să încerci din nou peste câteva minute.',
        errorRate: (minutes) =>
          `Ai trimis mai multe mesaje recent. Încearcă din nou peste ${minutes} ${minutes === 1 ? 'minut' : 'minute'}.`,
      },
    },
    info: {
      sectionLabel: 'Direct la atelier',
      emailLabel: 'Email',
      phoneLabel: 'Telefon',
      workshopLabel: 'Atelier',
      hoursLabel: 'Program',
      placeholderBanner:
        'Datele de contact și sediul vor fi actualizate înainte de lansare.',
      sign: 'Răspundem mereu personal.',
    },
  },
  en: {
    meta: {
      title: 'Contact — Oak Fantasy',
      description:
        'Write to us about a product, a custom engraving, or a B2B project. We reply within 24 hours, straight from the workshop.',
    },
    hero: {
      eyebrow: 'Talk to us',
      title: "We're here, in the workshop.",
      handwritten: 'fresh wood, hands at work',
      intro:
        "Product questions, custom orders, partnerships or plain curiosity — every message lands with us. We reply within 24 hours on business days.",
    },
    form: {
      sectionLabel: 'Send us a message',
      fields: {
        name: { label: 'Name', placeholder: 'how should we address you' },
        email: { label: 'Email', placeholder: 'your email address' },
        phone: {
          label: 'Phone',
          placeholder: 'optional, for quick follow-up',
          optional: 'optional',
        },
        subject: { label: 'Subject', placeholder: 'pick a subject' },
        message: {
          label: 'Message',
          placeholder:
            'tell us what you have in mind — sizes, dedication, delivery, questions…',
          counter: 'characters',
        },
      },
      submit: {
        idle: 'Send message',
        loading: 'Sending…',
        successHeadline: (name) =>
          `Thank you, ${name}! Your message made it to the workshop.`,
        successBody:
          "We'll get back to you within 24 hours on business days, straight from the bench.",
        errorGeneric:
          'Something went wrong. Please try again in a few minutes.',
        errorRate: (minutes) =>
          `You've sent a few messages recently. Try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`,
      },
    },
    info: {
      sectionLabel: 'Straight to the workshop',
      emailLabel: 'Email',
      phoneLabel: 'Phone',
      workshopLabel: 'Workshop',
      hoursLabel: 'Hours',
      placeholderBanner:
        'Contact details and address will be updated before launch.',
      sign: 'We always reply ourselves.',
    },
  },
};
