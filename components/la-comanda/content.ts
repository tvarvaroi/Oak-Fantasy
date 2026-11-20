import type { Locale } from '@/lib/i18n-routes';
import type { CustomOrderErrorCode } from '@/lib/schemas/custom-order';

// Bilingual copy for /la-comanda (RO) · /custom-orders (EN), approved by the
// founder 2026-11-18. Keys must stay symmetric across ro/en
// (scripts/check-i18n.mjs enforces parity). Plain strings only — no functions,
// so the map is safe on both sides of the RSC boundary. Links inside a sentence
// are split into lead / link / tail.

export interface CustomOrderCopy {
  meta: { title: string; description: string };
  /** Breadcrumb + nav label. */
  navLabel: string;
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleHandwritten: string;
    intro: string;
  };
  form: {
    heading: string;
    fields: {
      name: { label: string; placeholder: string };
      phone: { label: string; placeholder: string; hint: string };
      idea: { label: string; placeholder: string; counter: string };
    };
    submitIdle: string;
    submitLoading: string;
    errors: Record<CustomOrderErrorCode, string>;
    errorGeneric: string;
    errorRateLimited: string;
    consent: { lead: string; link: string; tail: string };
    returns: { lead: string; link: string; tail: string };
    /** Shown on the confirmation page (/la-comanda/sent) after a saved request. */
    success: { metaTitle: string; title: string; body: string; again: string };
  };
  make: {
    heading: string;
    intro: string;
    items: { title: string; body: string }[];
  };
  steps: {
    heading: string;
    items: { n: string; title: string; body: string }[];
  };
  cta: { heading: string; body: string; button: string };
  /** Homepage teaser band (components/CustomOrderTease.tsx). */
  teaser: { eyebrow: string; heading: string; body: string; cta: string };
}

export const CUSTOM_ORDER_CONTENT: Record<Locale, CustomOrderCopy> = {
  ro: {
    meta: {
      title: 'Tocătoare personalizate și lucrări din lemn la comandă — Oak Fantasy',
      description:
        'Tocătoare personalizate, gravuri, tablouri și ceasuri din stejar, lucrate manual la comandă în vestul României. Lasă-ne ideea, te contactăm noi.',
    },
    navLabel: 'La comandă',
    hero: {
      eyebrow: 'La comandă',
      titleLine1: 'Ai o idee?',
      titleLine2: 'O facem',
      titleHandwritten: 'în lemn.',
      intro:
        'Pe lângă tocătoarele din magazin, lucrăm și piese după ideea ta: o formă anume, un nume gravat, un cadou pentru cineva drag. Scrie-ne ideea aici, te contactăm pe WhatsApp și o facem de mână în atelierul nostru din vestul României.',
    },
    form: {
      heading: 'Fișă de comandă',
      fields: {
        name: { label: 'Nume', placeholder: 'Cum te numești' },
        phone: {
          label: 'Telefon (WhatsApp)',
          placeholder: '07xx xxx xxx',
          hint: 'Te contactăm pe WhatsApp la acest număr.',
        },
        idea: {
          label: 'Ideea ta',
          placeholder: 'Ce ți-ar plăcea să facem? Formă, mărime, ce să scrie pe ea, pentru cine e…',
          counter: '{count} / {max}',
        },
      },
      submitIdle: 'Trimite ideea',
      submitLoading: 'Se trimite…',
      errors: {
        name_short: 'Scrie-ne numele tău (cel puțin 2 litere).',
        name_long: 'Numele e prea lung (maximum 80 de caractere).',
        phone_required: 'Lasă-ne un număr de telefon, ca să te putem contacta.',
        phone_invalid: 'Număr de telefon invalid (ex: 0712 345 678).',
        idea_short: 'Spune-ne puțin mai mult despre idee (cel puțin 10 caractere).',
        idea_long: 'Ideea e prea lungă (maximum 2.000 de caractere). Restul ni-l poți spune pe WhatsApp.',
      },
      errorGeneric: 'Nu am putut trimite fișa acum. Încearcă din nou în câteva minute.',
      errorRateLimited: 'Ai trimis deja câteva idei în ultima oră. Încearcă din nou mai târziu.',
      consent: {
        lead: 'Trimițând fișa, ne dai voie să te contactăm pe WhatsApp la numărul lăsat, doar în legătură cu ideea ta. Detalii în ',
        link: 'Politica de confidențialitate',
        tail: '.',
      },
      returns: {
        lead: 'Pentru că fiecare lucrare la comandă e făcută după indicațiile tale, ea nu intră sub dreptul de retragere de 14 zile (OUG 34/2014, art. 16 lit. c). Tocmai de aceea stabilim totul împreună înainte să începem. Detalii în ',
        link: 'Politica de retur',
        tail: '.',
      },
      success: {
        metaTitle: 'Am primit ideea ta — Oak Fantasy',
        title: 'Am primit ideea ta.',
        body: 'Te contactăm pe WhatsApp la numărul lăsat.',
        again: 'Trimite altă idee',
      },
    },
    make: {
      heading: 'Ce putem face',
      intro: 'Câteva direcții, ca să-ți faci o idee. Dacă a ta nu e pe listă, scrie-ne oricum.',
      items: [
        {
          title: 'Tocătoare cu forma ta',
          body: 'Rotund, lung, cu mâner sau după un contur pe care ni-l desenezi. Alegem împreună forma și grosimea.',
        },
        {
          title: 'Gravuri personalizate',
          body: 'Un nume, o dată, o rețetă scrisă de mână sau un desen, gravate pe o piesă nouă sau pe un tocător din magazin.',
        },
        {
          title: 'Tablouri din lemn',
          body: 'Panouri de perete din stejar, gravate sau lăsate doar cu fibra lemnului.',
        },
        {
          title: 'Ceasuri',
          body: 'Ceasuri de perete din stejar masiv, cu cadranul gravat sau curat.',
        },
        {
          title: 'Cadouri pentru firme',
          body: 'Seturi pentru colegi, parteneri sau evenimente, cu sigla voastră gravată. Spune-ne câte bucăți îți trebuie și până când.',
        },
      ],
    },
    steps: {
      heading: 'Cum lucrăm o comandă',
      items: [
        {
          n: 'i.',
          title: 'Ne scrii ideea aici',
          body: 'În fișa de mai sus, cu cuvintele tale. Formă, mărime, ce să scrie pe ea, pentru cine e: orice detaliu ne ajută.',
        },
        {
          n: 'ii.',
          title: 'Te contactăm pe WhatsApp',
          body: 'Îți scriem la numărul lăsat și stabilim împreună mărimea, gravura și prețul. Acolo ne poți trimite și o schiță sau o poză de inspirație. Nu tăiem nimic până nu ești de acord.',
        },
        {
          n: 'iii.',
          title: 'O lucrăm și ți-o trimitem',
          body: 'O facem de mână în atelier, apoi o împachetăm și o trimitem prin curier oriunde în România.',
        },
      ],
    },
    cta: {
      heading: 'Spune-ne ce ai în minte',
      body: 'Câteva rânduri sunt de ajuns ca să începem. Dacă ideea nu se poate face în lemn, îți spunem sincer.',
      button: 'Trimite ideea',
    },
    teaser: {
      eyebrow: 'La comandă',
      // Non-breaking space after "O" keeps the one-letter word off the line end on phones.
      heading: 'Nu e în magazin? O putem face.',
      body: 'Tocătoare cu forma ta, gravuri cu un nume sau o dată, ceasuri și cadouri pentru firme. Ne scrii ideea, stabilim împreună detaliile, o lucrăm în atelier.',
      cta: 'Vezi cum lucrăm la comandă',
    },
  },
  en: {
    meta: {
      title: 'Custom Wooden Pieces & Personalised Cutting Boards — Oak Fantasy',
      description:
        "Personalised cutting boards, engravings, wall pieces and clocks in oak, made by hand to order in western Romania. Leave us your idea and we'll get in touch.",
    },
    navLabel: 'Custom orders',
    hero: {
      eyebrow: 'Custom orders',
      titleLine1: 'Have an idea?',
      titleLine2: "We'll make it",
      titleHandwritten: 'in wood.',
      intro:
        "Beyond the boards in our shop, we make pieces from your own idea: a particular shape, an engraved name, a gift for someone close. Leave us your idea here, we'll message you on WhatsApp, and we'll make it by hand in our workshop in western Romania.",
    },
    form: {
      heading: 'Order slip',
      fields: {
        name: { label: 'Name', placeholder: 'Your name' },
        phone: {
          label: 'Phone (WhatsApp)',
          placeholder: '07xx xxx xxx',
          hint: "We'll message you on WhatsApp at this number.",
        },
        idea: {
          label: 'Your idea',
          placeholder: "What would you like us to make? Shape, size, what it should say, who it's for…",
          counter: '{count} / {max}',
        },
      },
      submitIdle: 'Send your idea',
      submitLoading: 'Sending…',
      errors: {
        name_short: 'Please tell us your name (at least 2 letters).',
        name_long: 'That name is too long (80 characters max).',
        phone_required: 'Please leave a phone number so we can reach you.',
        phone_invalid: 'Please enter a Romanian phone number (e.g. 0712 345 678).',
        idea_short: 'Tell us a little more about your idea (at least 10 characters).',
        idea_long: "That's too long (2,000 characters max). You can tell us the rest on WhatsApp.",
      },
      errorGeneric: "We couldn't send your slip right now. Please try again in a few minutes.",
      errorRateLimited: "You've already sent a few ideas in the last hour. Please try again later.",
      consent: {
        lead: 'By sending this slip, you allow us to contact you on WhatsApp at the number you left, only about your idea. Details in our ',
        link: 'Privacy policy',
        tail: '.',
      },
      returns: {
        lead: 'Because every custom piece is made to your specifications, it is not covered by the 14-day right of withdrawal (Romanian GEO 34/2014, art. 16(c)). That is why we agree on everything together before we start. Details in our ',
        link: 'Returns policy',
        tail: '.',
      },
      success: {
        metaTitle: "We've got your idea — Oak Fantasy",
        title: "We've got your idea.",
        body: "We'll message you on WhatsApp at the number you left.",
        again: 'Send another idea',
      },
    },
    make: {
      heading: 'What we can make',
      intro: "A few directions to get you thinking. If yours isn't on the list, write to us anyway.",
      items: [
        {
          title: 'Boards in your shape',
          body: 'Round, long, with a handle, or cut to an outline you sketch for us. We choose the shape and thickness together.',
        },
        {
          title: 'Personal engravings',
          body: 'A name, a date, a handwritten recipe or a drawing, engraved on a new piece or on a board from our shop.',
        },
        {
          title: 'Wooden wall pieces',
          body: 'Oak wall panels, engraved or simply showing the grain.',
        },
        {
          title: 'Clocks',
          body: 'Solid oak wall clocks, with an engraved or plain face.',
        },
        {
          title: 'Corporate gifts',
          body: 'Sets for colleagues, partners or events, engraved with your logo. Tell us how many pieces you need and by when.',
        },
      ],
    },
    steps: {
      heading: 'How a custom order works',
      items: [
        {
          n: 'i.',
          title: 'You leave your idea here',
          body: "In the slip above, in your own words. Shape, size, what it should say, who it's for: every detail helps.",
        },
        {
          n: 'ii.',
          title: 'We message you on WhatsApp',
          body: 'We write to the number you left and agree on size, engraving and price together. You can send a sketch or an inspiration photo there too. Nothing gets cut until you say yes.',
        },
        {
          n: 'iii.',
          title: 'We make it and send it',
          body: 'We make it by hand in the workshop, then pack it and ship it by courier anywhere in Romania.',
        },
      ],
    },
    cta: {
      heading: 'Tell us what you have in mind',
      body: "A few lines are enough to start. If it can't be made in wood, we'll tell you honestly.",
      button: 'Send your idea',
    },
    teaser: {
      eyebrow: 'Custom orders',
      heading: 'Not in the shop? We can make it.',
      body: 'Boards in your own shape, engravings with a name or a date, clocks and corporate gifts. You send the idea, we agree the details together, we make it in the workshop.',
      cta: 'See how custom orders work',
    },
  },
};
