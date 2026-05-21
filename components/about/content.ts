import type { Locale } from '@/lib/i18n-routes';

// Bilingual content for the /despre (RO) / /about (EN) page.
// RO = verbatim from the approved Claude Design handoff `v2-timeline.html`
//      (full diacritics; the exact word "nealtoit" is intentional — never
//      substitute with "natural/neprelucrat").
// EN = founder-approved translations (sign-off 2026-05-18): US spelling,
//      "Built to last", "wild Carpathian oak", workshop line stays as the
//      section H2 ("Sawdust on the floor, oil on our fingers.").

export interface ProcessStep {
  /** "01".."05" */
  num: string;
  /** small uppercase tick, e.g. "Pas unu" / "Step one" */
  tick: string;
  title: string;
  /** Long-form body — kept for reference / future restoration. NOT rendered
   *  by ProcessTimeline since the 2026-05-27 medium-compact refactor. */
  body: string;
  /** 2–3 sentence body actually rendered by ProcessTimeline post-refactor.
   *  Trim of `body` retaining the essential information (drying duration,
   *  glue brand, grit count, etc.) without secondary anecdote. */
  bodyCompact: string;
  /** monospace caption for the striped placeholder image (design captions, kept EN) */
  placeholder: string;
}

export interface ValueCard {
  title: string;
  body: string;
}

export interface AboutContent {
  nav: { link: string };
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    /** rendered joined with <br/> */
    h1Lines: [string, string];
    sub: string;
  };
  process: {
    eyebrow: string;
    h2: string;
    /** Subheading rendered between h2 and the steps grid (post-refactor). */
    subHeading: string;
    lead: string;
    steps: ProcessStep[];
    /** Cross-link label rendered at end of process section -> /atelier#proces. */
    crossLinkLabel: string;
  };
  philosophy: {
    eyebrow: string;
    /** line 1 normal, line 2 rendered in italic copper <em> per design */
    h2Line1: string;
    h2Line2Em: string;
    paragraphs: [string, string, string];
  };
  workshop: {
    eyebrow: string;
    h2: string;
    paragraph: string;
    placeholder: string;
    /** Cross-link label rendered in workshop banner overlay -> /atelier. */
    crossLinkLabel: string;
  };
  values: {
    eyebrow: string;
    h2: string;
    lead: string;
    cards: [ValueCard, ValueCard, ValueCard, ValueCard];
  };
  cta: {
    h2: string;
    p: string;
    /** href anchors resolved against the locale homepage in <AboutCTA> */
    primaryLabel: string;
    primaryAnchor: '#waitlist';
    ghostLabel: string;
    ghostAnchor: '#products';
  };
}

const ro: AboutContent = {
  nav: { link: 'Despre' },
  meta: {
    title: 'Despre Oak Fantasy — Atelier de tocătoare din stejar românesc',
    // 146 chars; includes "tocător din lemn de stejar", "manual", "atelier românesc".
    description:
      'Tocător din lemn de stejar lucrat manual într-un atelier românesc mic. Stejar din Carpați, finisaj food-safe, fără linie de producție, fără grabă.',
  },
  hero: {
    eyebrow: 'Despre noi',
    h1Lines: [
      'Tocătoare lucrate cu răbdare,',
      'pentru bucătării care nu se grăbesc.',
    ],
    sub: 'Atelier de tocătoare din stejar românesc · Făcute manual · Est. 2026',
  },
  process: {
    eyebrow: 'Procesul',
    h2: 'Cinci pași între copac și bucătărie.',
    subHeading: 'De la copac la bucătărie',
    lead: 'De la stejarul nealtoit din Carpați până la tocătorul pe care îl primești acasă — fiecare etapă cere timp, atenție și mâinile aceluiași om.',
    steps: [
      {
        num: '01',
        tick: 'Pas unu',
        title: 'Alegerea lemnului',
        body: 'Cumpărăm stejar de la oameni din zona Carpaților, doar bucăți cu desen frumos și fără noduri în lemnul de muncă. Restul îl folosim pentru alte lucruri.',
        bodyCompact: 'Cumpărăm stejar din zona Carpaților, doar bucăți cu desen frumos. Restul îl folosim pentru alte lucruri.',
        placeholder: 'oak log · forest edge · light',
      },
      {
        num: '02',
        tick: 'Pas doi',
        title: 'Uscarea',
        body: 'Lemnul stă la uscat între 6 și 12 luni, până ajunge la umiditatea potrivită (8–10%). Fără asta, tocătorul ar plesni în primele luni de folosință. Nu sărim peste pas.',
        bodyCompact: 'Lemnul stă la uscat 6–12 luni, până ajunge la 8–10% umiditate. Fără asta, tocătorul ar plesni în primele luni.',
        placeholder: 'drying rack · stacked boards · barn',
      },
      {
        num: '03',
        tick: 'Pas trei',
        title: 'Tăierea și asamblarea',
        body: 'Tăiem la dimensiunile fiecărui SKU, apoi lipim cu adeziv alimentar Titebond III — același folosit în atelierele de mobilier din SUA și Europa de zeci de ani. Presăm și lăsăm să se odihnească 24 de ore.',
        bodyCompact: 'Tăiem la dimensiunile fiecărui SKU, apoi lipim cu adeziv alimentar Titebond III. Presăm 24 de ore.',
        placeholder: 'clamps · glue-up · workbench',
      },
      {
        num: '04',
        tick: 'Pas patru',
        title: 'Șlefuirea',
        body: 'Trecem prin patru-cinci graduri de șlefuit, de la 80 la 320. Trebuie să simți lemnul fără rugozități, dar și fără să fie lucios — un tocător prea neted nu îți «ține» cuțitul, alunecă.',
        bodyCompact: 'Patru-cinci graduri de la 80 la 320. Trebuie să simți lemnul fără rugozități, dar și fără să fie lucios.',
        placeholder: 'sanding · grit progression · sawdust',
      },
      {
        num: '05',
        tick: 'Pas cinci',
        title: 'Finisajul',
        body: 'Ungem cu ulei alimentar + ceară de albine — câteva straturi, fiecare lăsat să intre în lemn 24 de ore. Asta îți protejează tocătorul, hrănește lemnul, și-l face să arate mai bun cu vârsta.',
        bodyCompact: 'Ungem cu ulei alimentar și ceară de albine — câteva straturi, fiecare lăsat să intre în lemn 24 de ore.',
        placeholder: 'oil rag · finished board · low light',
      },
    ],
    crossLinkLabel: 'Vezi cum lucrăm în atelier',
  },
  philosophy: {
    eyebrow: 'Filosofia noastră',
    h2Line1: 'Un atelier mic.',
    h2Line2Em: 'Un singur copac.',
    paragraphs: [
      'În atelierul nostru, fiecare tocător începe ca o bucată de stejar românesc — uscată încet, ani de zile, până când lemnul devine stabil și gata să primească mâna omului. Tăiem, lipim și finisăm fiecare placă singuri, fără linie de producție, fără grabă. Asta înseamnă că nu putem face mii pe lună. Înseamnă, în schimb, că fiecare tocător care iese din atelierul nostru poartă semnele unei singure perechi de mâini și ale unui singur copac.',
      'Stejarul din Carpați e dens, închis la culoare, cu desen frumos pe oriunde îl tai. E lemnul potrivit pentru ceva ce vei folosi în fiecare zi pentru următorii zece, douăzeci, treizeci de ani. Asta facem noi — obiecte care durează cât bucătăria.',
      'Nu suntem o fabrică. Suntem un atelier mic, român, care crede că un tocător din lemn poate fi un obiect care merită păstrat.',
    ],
  },
  workshop: {
    eyebrow: 'Atelierul',
    h2: 'Cu rumeguș pe podele și ulei pe degete.',
    paragraph:
      'Lucrăm într-un atelier mic, undeva în zona Carpaților, unde lumina e bună dimineața și liniștită seara. Aici tăiem, șlefuim și împachetăm fiecare tocător. Aici primim și mesajele voastre. Nu e showroom — e atelier.',
    placeholder: 'workshop interior · golden hour · wide shot',
    crossLinkLabel: 'Vezi atelierul în detaliu',
  },
  values: {
    eyebrow: 'Valorile noastre',
    h2: 'Ce nu negociem.',
    lead: 'Patru principii pe care le purtăm cu noi din prima zi în atelier.',
    cards: [
      {
        title: 'Răbdare',
        body: 'Lemnul nu se grăbește, nici noi. Fiecare tocător primește timpul de care are nevoie.',
      },
      {
        title: 'Lemn local',
        body: 'Lucrăm doar cu stejar românesc din pădurile noastre, fără import, fără compromis.',
      },
      {
        title: 'Durabil',
        body: 'Un tocător făcut cum trebuie ține zeci de ani. Asta e standardul nostru.',
      },
      {
        title: 'Manual',
        body: 'Nicio linie de producție. Doar mâini, scule, și atenție.',
      },
    ],
  },
  cta: {
    h2: 'Lansăm în octombrie.',
    p: 'Primii pe listă primesc 15% reducere și ghidul nostru de îngrijire a lemnului — gratuit.',
    primaryLabel: 'Înscrie-te pe lista de lansare',
    primaryAnchor: '#waitlist',
    ghostLabel: 'Vezi tocătoarele noastre',
    ghostAnchor: '#products',
  },
};

const en: AboutContent = {
  nav: { link: 'About' },
  meta: {
    title: 'About Oak Fantasy — Romanian oak cutting board workshop',
    // ~152 chars; mirrors RO with EN keywords (oak cutting boards, handmade, Romanian workshop).
    description:
      'Handmade oak cutting boards from a small Romanian workshop. Carpathian oak, food-safe finish, no production line, no rush — built to last for decades.',
  },
  hero: {
    eyebrow: 'About us',
    h1Lines: [
      'Cutting boards made with patience,',
      "for kitchens that aren't in a hurry.",
    ],
    sub: 'Workshop for Romanian oak cutting boards · Handmade · Est. 2026',
  },
  process: {
    eyebrow: 'The process',
    h2: 'Five steps between the tree and your kitchen.',
    subHeading: 'From tree to kitchen',
    lead: 'From wild Carpathian oak to the board that arrives at your home — every stage takes time, attention, and the same pair of hands.',
    steps: [
      {
        num: '01',
        tick: 'Step one',
        title: 'Choosing the wood',
        body: 'We buy oak from people in the Carpathian region — only pieces with beautiful grain and no knots in the working surface. The rest we use for other things.',
        bodyCompact: 'We buy oak from the Carpathian region, only pieces with beautiful grain. The rest we use for other things.',
        placeholder: 'oak log · forest edge · light',
      },
      {
        num: '02',
        tick: 'Step two',
        title: 'Drying',
        body: 'The wood dries for 6 to 12 months, until it reaches the right moisture (8–10%). Without this, the board would crack in its first months of use. We don’t skip this step.',
        bodyCompact: 'Wood dries for 6–12 months until it reaches 8–10% humidity. Without this, the board would crack in its first months.',
        placeholder: 'drying rack · stacked boards · barn',
      },
      {
        num: '03',
        tick: 'Step three',
        title: 'Cutting and assembly',
        body: 'We cut to each SKU’s dimensions, then glue with Titebond III food-safe adhesive — the same one used in furniture workshops across the US and Europe for decades. We press and let it rest for 24 hours.',
        bodyCompact: 'We cut to each SKU’s dimensions, then glue with food-safe Titebond III adhesive. We press for 24 hours.',
        placeholder: 'clamps · glue-up · workbench',
      },
      {
        num: '04',
        tick: 'Step four',
        title: 'Sanding',
        body: 'We work through four or five sanding grits, from 80 to 320. You should feel the wood with no roughness, but not glossy either — a board that’s too smooth doesn’t “grip” the knife — it slips.',
        bodyCompact: 'Four-five grits from 80 to 320. You should feel the wood with no roughness, but not glossy either.',
        placeholder: 'sanding · grit progression · sawdust',
      },
      {
        num: '05',
        tick: 'Step five',
        title: 'The finish',
        body: 'We rub in food-safe oil + beeswax — a few coats, each left to soak into the wood for 24 hours. This protects your board, feeds the wood, and makes it look better with age.',
        bodyCompact: 'We rub in food-safe oil and beeswax — a few coats, each left to soak into the wood for 24 hours.',
        placeholder: 'oil rag · finished board · low light',
      },
    ],
    crossLinkLabel: 'See how we work in the workshop',
  },
  philosophy: {
    eyebrow: 'Our philosophy',
    h2Line1: 'A small workshop.',
    h2Line2Em: 'A single tree.',
    paragraphs: [
      'In our workshop, every board begins as a piece of Romanian oak — dried slowly, over years, until the wood is stable and ready for a human hand. We cut, glue and finish each board ourselves, with no production line, no rush. It means we can’t make thousands a month. It means, instead, that every board that leaves our workshop carries the marks of a single pair of hands and a single tree.',
      'Carpathian oak is dense, dark, with beautiful grain wherever you cut it. It’s the right wood for something you’ll use every day for the next ten, twenty, thirty years. That’s what we make — objects that last as long as the kitchen.',
      'We are not a factory. We are a small Romanian workshop that believes a wooden cutting board can be an object worth keeping.',
    ],
  },
  workshop: {
    eyebrow: 'The workshop',
    h2: 'Sawdust on the floor, oil on our fingers.',
    paragraph:
      'We work in a small workshop, somewhere in the Carpathian region, where the light is good in the morning and quiet in the evening. Here we cut, sand and pack every board. Here we also receive your messages. It’s not a showroom — it’s a workshop.',
    placeholder: 'workshop interior · golden hour · wide shot',
    crossLinkLabel: 'See the workshop in detail',
  },
  values: {
    eyebrow: 'Our values',
    h2: 'What we won’t compromise.',
    lead: 'Four principles we’ve carried with us since day one in the workshop.',
    cards: [
      {
        title: 'Patience',
        body: 'Wood doesn’t rush, and neither do we. Every board gets the time it needs.',
      },
      {
        title: 'Local wood',
        body: 'We work only with Romanian oak from our own forests — no imports, no compromise.',
      },
      {
        title: 'Built to last',
        body: 'A board made right lasts for decades. That’s our standard.',
      },
      {
        title: 'By hand',
        body: 'No production line. Just hands, tools, and attention.',
      },
    ],
  },
  cta: {
    h2: 'We launch in October.',
    p: 'The first on the list get 15% off and our free wood care guide.',
    primaryLabel: 'Join the launch list',
    primaryAnchor: '#waitlist',
    ghostLabel: 'See our cutting boards',
    ghostAnchor: '#products',
  },
};

export const ABOUT_CONTENT: Record<Locale, AboutContent> = { ro, en };
