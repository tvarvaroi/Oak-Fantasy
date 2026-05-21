import type { Locale } from '@/lib/i18n-routes';

// Bilingual content for /atelier (RO) / /workshop (EN).
// RO = verbatim from the approved Claude Design handoff `v3-catalog.html`
//      (Variant C, Tool-Forward Catalog).
// EN = founder-approved glossary (sign-off 2026-05-27). Tool names use
//      "translated lead" format (e.g. "Bosch GTS 635-216 table saw").
//      Brand-model strings are PRESERVED across locales verbatim.

export interface HeroCell {
  /** Label printed inside one of the 9 rotated grid cells of the hero. */
  label: string;
}

export interface Tool {
  /** Pill tag in the top-left corner: "Featured · Tăiere" / "Asamblare" etc. */
  tag: string;
  /** Tool name. Brand+model is preserved verbatim across locales. */
  name: string;
  /** One-line italic copper role description below h3. */
  role: string;
  /** 1-3 sentence description. */
  desc: string;
  /** Monospace caption inside the striped image placeholder. */
  placeholder: string;
}

export interface DayMoment {
  /** "7:00–10:00 · Dimineața" */
  time: string;
  title: string;
  body: string;
}

export interface ProcessStep {
  /** Roman numeral "i", "ii", "iii", "iv", "v" — matches v3-catalog. */
  n: string;
  title: string;
  body: string;
}

export interface ConditionCard {
  /** Small caps label above paragraph. */
  label: string;
  /** Body with **strong** highlights (rendered via <strong>). */
  body: string;
}

export interface SeasonCard {
  title: string;
  body: string;
}

export interface ArticleCard {
  topic: string;
  title: string;
  /** Always "Articol în pregătire" / "Article coming soon" for now. */
  meta: string;
}

export interface AtelierContent {
  nav: { link: string };
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    h1Line1: string;
    /** Rendered with <em> italic copper accent. */
    h1Line2Em: string;
    /** Second part of line 2 (after the em). */
    h1Line2Tail: string;
    sub: string;
    readTime: string;
    /** 9 cells in 3×3 rotated grid (tools + sensors + light). */
    cells: HeroCell[];
  };
  tools: {
    eyebrow: string;
    h2Line1: string;
    /** Rendered with <em>. */
    h2Em: string;
    intro: string;
    items: [Tool, Tool, Tool, Tool, Tool, Tool];
  };
  place: {
    eyebrow: string;
    h2Line1: string;
    h2Em: string;
    /** Trailing period or word after em, if any. */
    paragraphs: [string, string];
    /** Two placeholder captions for the stacked image column. */
    placeholderTop: string;
    placeholderBottom: string;
  };
  day: {
    eyebrow: string;
    h2Line1: string;
    h2Em: string;
    intro: string;
    moments: [DayMoment, DayMoment, DayMoment, DayMoment];
  };
  /** Pull-quote bridge between #zi and #proces. */
  pullquote: string;
  process: {
    eyebrow: string;
    h2Line1: string;
    h2Em: string;
    /** Italic preamble paragraph above the steps. */
    intro: string;
    steps: [ProcessStep, ProcessStep, ProcessStep, ProcessStep, ProcessStep];
    /** Cross-ref link label to /despre#proces. */
    crossLinkLabel: string;
  };
  conditions: {
    eyebrow: string;
    h2Line1: string;
    h2Em: string;
    h2Tail: string;
    intro: string;
    cards: [ConditionCard, ConditionCard];
  };
  seasonality: {
    eyebrow: string;
    h2Line1: string;
    h2Em: string;
    h2Tail: string;
    cards: [SeasonCard, SeasonCard, SeasonCard, SeasonCard];
  };
  articles: {
    eyebrow: string;
    h2Line1: string;
    h2Em: string;
    intro: string;
    items: [ArticleCard, ArticleCard, ArticleCard, ArticleCard];
  };
  cta: {
    h2Line1: string;
    h2Em: string;
    primaryLabel: string;
    ghostLabel: string;
  };
}

const ro: AtelierContent = {
  nav: { link: 'Atelier' },
  meta: {
    title: 'Atelierul Oak Fantasy — Cum se face fiecare tocător din stejar',
    // 143 chars
    description:
      'Atelier mic în Carpați. Stejar românesc, uscat 6–12 luni, șase unelte. Cum lucrăm manual fiecare tocător — de la lemn la ceară de albine.',
  },
  hero: {
    eyebrow: 'Documentar · Atelier',
    h1Line1: 'Un atelier mic, în zona Carpaților.',
    h1Line2Em: 'Și o singură regulă:',
    h1Line2Tail: 'nu grăbim lemnul.',
    sub: 'Un loc, șase unelte, o zi de lucru · Atelier Oak Fantasy',
    readTime: 'Citește în ~7 minute',
    cells: [
      { label: 'Planou circular' },
      { label: 'Freză verticală' },
      { label: 'Presă cu șuruburi' },
      { label: 'Rindeluitor electric' },
      { label: 'Șlefuitor orbital' },
      { label: 'Unelte de mână' },
      { label: 'Higrometru' },
      { label: 'Termometru' },
      { label: 'Lumină naturală' },
    ],
  },
  tools: {
    eyebrow: 'Cu ce lucrăm',
    h2Line1: 'Catalogul',
    h2Em: 'uneltelor',
    intro:
      'Nu sunt multe unelte într-un atelier care face tocătoare. Sunt cele potrivite. Fiecare cu rolul ei, fiecare aleasă cu motiv. Mai jos sunt cele pe care le folosim aproape în fiecare zi — în ordinea în care intră în lucru.',
    items: [
      {
        tag: 'Featured · Tăiere',
        name: 'Planou circular Bosch GTS 635-216',
        role: 'Unealta cu care începe orice tocător.',
        desc: 'Tăie scândurile la dimensiuni precise. Lama subțire, ghidaj fix, masă mare. Pentru tăieri repetate la aceeași dimensiune, nu există ceva mai bun.',
        placeholder: 'circular saw · bench · wide framing',
      },
      {
        tag: 'Featured · Margine',
        name: 'Freză verticală cu ghidaj',
        role: 'Marginile plăcute la atingere, nu tăioase.',
        desc: 'Pentru rotunjirea marginilor și mânerelor. Bity de 6mm și 12mm, R profile.',
        placeholder: 'router · edge profile · curl',
      },
      {
        tag: 'Asamblare',
        name: 'Presă manuală cu șuruburi (4 buc.)',
        role: 'Patru prese, 24 de ore, niciodată mai puțin.',
        desc: 'Pentru lipirea plăcilor în bloc. Patru prese pe un bloc de 35×25cm, presiune uniformă.',
        placeholder: '4 clamps · glue line',
      },
      {
        tag: 'Aplatizare',
        name: 'Rindeluitor electric Makita KP0810',
        role: 'Suprafețe perfect plane după lipire.',
        desc: 'Tăieri subțiri, pe direcția fibrei, până când blocul e perfect plan.',
        placeholder: 'electric planer · shavings',
      },
      {
        tag: 'Șlefuit',
        name: 'Șlefuitor orbital Festool ETS 150/3',
        role: 'De la 80 la 320. Fără apăsare, fără grabă.',
        desc: 'Patru-cinci graduri de hârtie abrazivă. Mișcare circulară, fără apăsare, fără grabă.',
        placeholder: 'orbital sander · close-up',
      },
      {
        tag: 'Detalii',
        name: 'Set unelte de mână',
        role: 'Fierăstrău, raspele, ciocan, daltă, șubler digital.',
        desc: 'Pentru detalii care nu cer motor. Tăieri fine, ajustări, măsurători. Unelte care durează zeci de ani dacă sunt îngrijite — și pe care le folosim aproape la fel de mult ca electricele.',
        placeholder: 'hand tools wall · low light',
      },
    ],
  },
  place: {
    eyebrow: 'Atelierul ca loc',
    h2Line1: 'Locul unde se face',
    h2Em: 'treaba.',
    paragraphs: [
      'Atelierul nostru e o încăpere de vreo șaizeci de metri pătrați, undeva în zona Carpaților. Are lumină naturală bună până pe la patru după-amiaza, apoi aprindem lămpile. Iarna intră soarele direct pe geamul de est dimineața — atunci facem treaba care cere ochi bun, șlefuit fin, asamblare. Vara stăm mai mult în partea umbrită, unde temperatura rămâne stabilă.',
      'Miroase a stejar — un miros dulce, ușor acrișor, care se ține în haine și în păr. Sunetul depinde de ce facem: motoarele de la planoiul circular și freză sunt cele zgomotoase, dar le folosim pe rând și nu toată ziua. Cel mai mult timp lucrăm cu unelte de mână — și atunci e liniște, doar fierăstrău, raspel, șmirghel.',
    ],
    placeholderTop: 'workshop wide · 60sqm · east window',
    placeholderBottom: 'workbench detail · sawdust · tools',
  },
  day: {
    eyebrow: 'O zi în atelier',
    h2Line1: 'Ritmul',
    h2Em: 'unei zile.',
    intro:
      'Nu există două zile identice — depinde de ce SKU lucrăm, de etapa la care suntem, de vreme. Dar ritmul general e cam același.',
    moments: [
      {
        time: '7:00–10:00 · Dimineața',
        title: 'Verificări și muncă grea',
        body: 'Verificăm temperatura și umiditatea în atelier — trebuie să fie între 18–22°C și 45–55% umiditate. Dacă nu sunt, ajustăm cu dezumidificator sau aerisire. Apoi cea mai grea muncă a zilei: tăieri și asamblare. Mintea e proaspătă, ochiul e atent.',
      },
      {
        time: '10:00–11:00 · Pauză',
        title: 'O cafea, o respirație',
        body: 'O cafea, o gustare, o respirație. Atelierul rămâne în liniște — lemnul lucrat dimineața se «odihnește» după presare.',
      },
      {
        time: '11:00–15:00 · După-amiaza',
        title: 'Lucrări de finețe',
        body: 'Lucrări de finețe — șlefuit, frezat margini, gravare dacă avem comenzi personalizate. Muzică liniștită pe fundal. Pauze scurte la fiecare oră.',
      },
      {
        time: '15:00–18:00 · Seara',
        title: 'Finisaj și închidere',
        body: 'Aplicare ulei și ceară, ambalare comenzi gata, ordine în atelier pentru a doua zi. Curățare unelte, sortat rumeguș pentru aprins focul iarna. Ultimul lucru: notați ce am făcut, ce mai e de făcut.',
      },
    ],
  },
  pullquote: 'Cel mai mult timp lucrăm cu unelte de mână — și atunci e liniște.',
  process: {
    eyebrow: 'Procesul în sumar',
    h2Line1: 'Cinci pași,',
    h2Em: 'foarte pe scurt.',
    intro:
      'Procesul detaliat — cu mărimile, uneltele și timpii — e descris pe pagina noastră despre. Aici e versiunea scurtă, pentru context.',
    steps: [
      { n: 'i.',   title: 'Alegerea lemnului',      body: 'Stejar local, fără noduri, cu desen frumos. Restul îl folosim altfel.' },
      { n: 'ii.',  title: 'Uscarea',                body: '6–12 luni în aer, până ajunge la 8–10% umiditate.' },
      { n: 'iii.', title: 'Tăierea și asamblarea', body: 'Dimensiuni precise, adeziv alimentar, presare 24 de ore.' },
      { n: 'iv.',  title: 'Șlefuirea',              body: 'Patru-cinci graduri, de la 80 la 320.' },
      { n: 'v.',   title: 'Finisajul',              body: 'Ulei alimentar și ceară de albine, strat după strat.' },
    ],
    crossLinkLabel: 'Detalii complete pe pagina Despre',
  },
  conditions: {
    eyebrow: 'Condițiile',
    h2Line1: 'Lucruri pe care',
    h2Em: 'nu le vezi,',
    h2Tail: 'dar contează.',
    intro:
      'Două lucruri pe care le verificăm zilnic și care fac diferența între un tocător care durează zeci de ani și unul care plesnește în primele luni.',
    cards: [
      {
        label: 'Higrometru & termometru',
        body: 'Lemnul e un material viu. Răspunde la umiditate, la temperatură, la cum e depozitat. De-asta ținem în atelier un **higrometru** și un **termometru** — și verificăm de două ori pe zi. Umiditatea aerului trebuie să fie între 45 și 55%. Sub 40%, lemnul își pierde apa proprie și începe să crape. Peste 60%, absoarbe apă din aer și se umflă.',
      },
      {
        label: 'Două zone de depozitare',
        body: 'Lemnul așteaptă în două locuri: **zona de uscat** (pentru bucățile care se usucă lent, 6–12 luni) și **zona de lucru** (pentru ce e gata pus în operă, săptămâna asta sau luna asta). Niciodată nu amestecăm. Și niciodată nu folosim lemn care nu și-a făcut timpul.',
      },
    ],
  },
  seasonality: {
    eyebrow: 'Sezonalitatea',
    h2Line1: 'Vremea',
    h2Em: 'schimbă',
    h2Tail: 'munca.',
    cards: [
      { title: 'Iarna',     body: 'Aerul mai uscat, lemnul mai stabil. E sezonul cel mai bun pentru asamblări mari — blocurile end-grain, platourile lungi. Atelierul e încălzit cu lemn (resturi de la noi), temperatura constantă.' },
      { title: 'Primăvara', body: 'Umiditatea urcă. Suntem atenți la depozitare. E perioada în care primim lemn nou de la furnizori — bucățile de stejar care vor sta la uscat 6–12 luni înainte să devină tocătoare.' },
      { title: 'Vara',      body: 'Cele mai grele luni — căldură, umiditate variabilă. Lucrăm mai mult dimineața devreme și seara târziu. Dezumidificatorul merge non-stop. Asamblări complexe le evităm vara — așteptăm toamna.' },
      { title: 'Toamna',    body: 'Sezonul favorit. Aer stabil, temperatură plăcută, lemnul reacționează predictibil. Multe comenzi pentru cadouri de Crăciun — atelierul lucrează la capacitate maximă.' },
    ],
  },
  articles: {
    eyebrow: 'Articole conexe',
    h2Line1: 'Mai multe despre',
    h2Em: 'meserie.',
    intro:
      'Articole care explică în detaliu părți specifice din ce facem. Vor fi disponibile când publicăm secțiunea noastră de blog.',
    items: [
      { topic: 'Tehnică · Uscare',      title: 'De ce uscăm lemnul 6–12 luni — știința umidității',                  meta: 'Articol în pregătire' },
      { topic: 'Tehnică · Construcție', title: 'End-grain vs edge-grain — diferența care nu se vede',                meta: 'Articol în pregătire' },
      { topic: 'Finisaj',                title: 'Ulei și ceară de albine — finisajul tradițional pentru lemn alimentar', meta: 'Articol în pregătire' },
      { topic: 'Ghid',                   title: 'Cum alegi mărimea potrivită pentru bucătăria ta',                    meta: 'Articol în pregătire' },
    ],
  },
  cta: {
    h2Line1: 'Ai văzut uneltele.',
    h2Em: 'Hai să vezi și tocătoarele.',
    primaryLabel: 'Vezi tocătoarele noastre',
    ghostLabel: 'Înscrie-te pe lista de lansare',
  },
};

const en: AtelierContent = {
  nav: { link: 'Workshop' },
  meta: {
    title: 'Oak Fantasy Workshop — How every oak cutting board is made',
    // 142 chars
    description:
      'Small workshop in the Carpathians. Romanian oak, dried 6–12 months, six tools. How we handcraft every cutting board — from wood to beeswax.',
  },
  hero: {
    eyebrow: 'Documentary · Workshop',
    h1Line1: 'A small workshop in the Carpathians.',
    h1Line2Em: 'And one rule:',
    h1Line2Tail: "we don't rush the wood.",
    sub: 'One place, six tools, one working day · Oak Fantasy Workshop',
    readTime: 'Read in ~7 minutes',
    cells: [
      { label: 'Table saw' },
      { label: 'Plunge router' },
      { label: 'Screw clamps' },
      { label: 'Hand planer' },
      { label: 'Orbital sander' },
      { label: 'Hand tools' },
      { label: 'Hygrometer' },
      { label: 'Thermometer' },
      { label: 'Natural light' },
    ],
  },
  tools: {
    eyebrow: 'What we work with',
    h2Line1: 'The catalog of our',
    h2Em: 'tools.',
    intro:
      "There aren't many tools in a workshop that makes cutting boards. There are the right ones. Each with its role, each chosen for a reason. Below are the ones we use almost every day — in the order they come into work.",
    items: [
      {
        tag: 'Featured · Cutting',
        name: 'Bosch GTS 635-216 table saw',
        role: 'The tool every cutting board starts with.',
        desc: "Cuts boards to precise dimensions. Thin blade, fixed guide, large table. For repeated cuts at the same size, nothing's better.",
        placeholder: 'circular saw · bench · wide framing',
      },
      {
        tag: 'Featured · Edge',
        name: 'Plunge router with edge guide',
        role: 'Edges pleasant to touch, not sharp.',
        desc: 'For rounding edges and handles. 6mm and 12mm bits, R profile.',
        placeholder: 'router · edge profile · curl',
      },
      {
        tag: 'Assembly',
        name: 'Manual screw clamps (4 pcs.)',
        role: 'Four clamps, 24 hours, never less.',
        desc: 'For glueing planks into a block. Four clamps on a 35×25cm block, uniform pressure.',
        placeholder: '4 clamps · glue line',
      },
      {
        tag: 'Flattening',
        name: 'Makita KP0810 hand planer',
        role: 'Perfectly flat surfaces after glueing.',
        desc: 'Thin cuts, along the grain, until the block is perfectly flat.',
        placeholder: 'electric planer · shavings',
      },
      {
        tag: 'Sanding',
        name: 'Festool ETS 150/3 orbital sander',
        role: 'From 80 to 320. No pressure, no rush.',
        desc: 'Four-five grits of sandpaper. Circular motion, no pressure, no rush.',
        placeholder: 'orbital sander · close-up',
      },
      {
        tag: 'Details',
        name: 'Hand tool set',
        role: 'Saw, rasps, hammer, chisel, digital caliper.',
        desc: "For details that don't need a motor. Fine cuts, adjustments, measurements. Tools that last decades if cared for — and we use them almost as much as the electric ones.",
        placeholder: 'hand tools wall · low light',
      },
    ],
  },
  place: {
    eyebrow: 'The workshop as a place',
    h2Line1: 'The place where the',
    h2Em: 'work',
    paragraphs: [
      'Our workshop is a room of about sixty square meters, somewhere in the Carpathians. It has good natural light until around four in the afternoon, then we turn on the lamps. In winter the sun comes in directly through the east window in the morning — that is when we do the work that needs a careful eye: fine sanding, assembly. In summer we stay more in the shaded part, where the temperature stays stable.',
      "It smells of oak — a sweet, slightly tart smell that clings to clothes and hair. The sound depends on what we are doing: the motors of the table saw and router are the loud ones, but we use them one at a time, not all day. Most of the time we work with hand tools — and then it is quiet, just saw, rasp, sandpaper.",
    ],
    placeholderTop: 'workshop wide · 60sqm · east window',
    placeholderBottom: 'workbench detail · sawdust · tools',
  },
  day: {
    eyebrow: 'A day in the workshop',
    h2Line1: 'The rhythm of',
    h2Em: 'a day.',
    intro:
      "No two days are alike — it depends on which SKU we're working on, what stage we're at, the weather. But the general rhythm is about the same.",
    moments: [
      {
        time: '7:00–10:00 · Morning',
        title: 'Checks and heavy work',
        body: "We check temperature and humidity in the workshop — should be between 18–22°C and 45–55% humidity. If not, we adjust with a dehumidifier or ventilation. Then the hardest work of the day: cuts and assembly. Mind is fresh, eye is sharp.",
      },
      {
        time: '10:00–11:00 · Break',
        title: 'A coffee, a breath',
        body: 'A coffee, a snack, a breath. The workshop stays quiet — the wood worked in the morning «rests» after clamping.',
      },
      {
        time: '11:00–15:00 · Afternoon',
        title: 'Fine work',
        body: 'Fine work — sanding, edge routing, engraving if we have custom orders. Quiet music in the background. Short breaks every hour.',
      },
      {
        time: '15:00–18:00 · Evening',
        title: 'Finishing and closing',
        body: "Applying oil and wax, packing finished orders, tidying the workshop for the next day. Cleaning tools, sorting sawdust for winter fire-starting. Last thing: notes on what we did, what's left to do.",
      },
    ],
  },
  pullquote: "Most of the time we work with hand tools — and then it's quiet.",
  process: {
    eyebrow: 'The process in summary',
    h2Line1: 'Five steps,',
    h2Em: 'very briefly.',
    intro:
      "The detailed process — with measurements, tools, and timings — is described on our about page. Here's the short version, for context.",
    steps: [
      { n: 'i.',   title: 'Choosing the wood',    body: 'Local oak, no knots, beautiful grain. The rest we use otherwise.' },
      { n: 'ii.',  title: 'Drying',                body: '6–12 months in air, until it reaches 8–10% humidity.' },
      { n: 'iii.', title: 'Cutting and assembly', body: 'Precise dimensions, food-safe adhesive, 24-hour clamping.' },
      { n: 'iv.',  title: 'Sanding',               body: 'Four-five grits, from 80 to 320.' },
      { n: 'v.',   title: 'Finishing',             body: 'Food-safe oil and beeswax, layer after layer.' },
    ],
    crossLinkLabel: 'Full details on the About page',
  },
  conditions: {
    eyebrow: 'The conditions',
    h2Line1: 'Things you',
    h2Em: "don't see,",
    h2Tail: 'but matter.',
    intro:
      'Two things we check daily that make the difference between a cutting board that lasts decades and one that cracks in the first months.',
    cards: [
      {
        label: 'Hygrometer & thermometer',
        body: "Wood is a living material. It responds to humidity, temperature, how it's stored. That's why we keep a **hygrometer** and **thermometer** in the workshop — and check them twice a day. Air humidity should be between 45 and 55%. Below 40%, wood loses its own water and starts to crack. Above 60%, it absorbs water from the air and swells.",
      },
      {
        label: 'Two storage zones',
        body: "Wood waits in two places: the **drying zone** (for pieces drying slowly, 6–12 months) and the **work zone** (for what's ready to be used, this week or this month). We never mix. And we never use wood that hasn't had its time.",
      },
    ],
  },
  seasonality: {
    eyebrow: 'The seasons',
    h2Line1: 'The weather',
    h2Em: 'changes',
    h2Tail: 'the work.',
    cards: [
      { title: 'Winter', body: 'Drier air, more stable wood. The best season for big assemblies — end-grain blocks, long platters. The workshop is heated with wood (our scraps), temperature constant.' },
      { title: 'Spring', body: "Humidity rises. We're careful with storage. It's when we receive new wood from suppliers — oak pieces that will sit drying for 6–12 months before becoming cutting boards." },
      { title: 'Summer', body: 'The hardest months — heat, variable humidity. We work more early in the morning and late in the evening. The dehumidifier runs non-stop. Complex assemblies we avoid in summer — we wait for autumn.' },
      { title: 'Autumn', body: 'Favorite season. Stable air, pleasant temperature, wood responds predictably. Many orders for Christmas gifts — the workshop works at full capacity.' },
    ],
  },
  articles: {
    eyebrow: 'Related articles',
    h2Line1: 'More about the',
    h2Em: 'craft.',
    intro:
      "Articles that explain in detail specific parts of what we do. They'll be available when we publish our blog section.",
    items: [
      { topic: 'Technique · Drying',       title: 'Why we dry wood for 6–12 months — the science of humidity', meta: 'Article coming soon' },
      { topic: 'Technique · Construction', title: "End-grain vs edge-grain — the difference you don't see",     meta: 'Article coming soon' },
      { topic: 'Finishing',                 title: 'Oil and beeswax — the traditional finish for food-safe wood', meta: 'Article coming soon' },
      { topic: 'Guide',                     title: 'How to choose the right size for your kitchen',                meta: 'Article coming soon' },
    ],
  },
  cta: {
    h2Line1: "You've seen the tools.",
    h2Em: "Now let's see the boards.",
    primaryLabel: 'See our cutting boards',
    ghostLabel: 'Join the launch waitlist',
  },
};

export const ATELIER_CONTENT: Record<Locale, AtelierContent> = { ro, en };
