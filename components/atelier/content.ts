import type { Locale } from '@/lib/i18n-routes';

// Bilingual content for /atelier (RO) / /workshop (EN).
// RO = verbatim from the approved Claude Design handoff `v3-catalog.html`
//      (Variant C, Tool-Forward Catalog).
// EN = founder-approved glossary (sign-off 2026-05-27).
// Tool names are GENERIC tool types (2026-11-19, founder): no brand, no model
// code, no spec that only makes sense for one model — in name, desc or alt.

export interface HeroCell {
  /**
   * One of the 9 rotated grid cells of the hero (2026-10-15: real product
   * photos instead of tool labels). 640px WebP thumbnails of the Supabase
   * hero images, extracted once into /public/products/atelier-*.webp.
   * Same `src` both locales; `alt` localized.
   */
  src: string;
  alt: string;
}

export interface Tool {
  /** Pill tag in the top-left corner: "Featured · Tăiere" / "Asamblare" etc. */
  tag: string;
  /** Generic tool type — never a brand or model code (2026-11-19). */
  name: string;
  /** One-line italic copper role description below h3. */
  role: string;
  /** 1-3 sentence description. */
  desc: string;
  /** Card photo (stock, Pexels — see docs/stock-credits.md). Same path both locales. */
  image: string;
  /** Honest alt text for the stock photo (describes what is pictured, not our claims). */
  imageAlt: string;
}

export interface DayMoment {
  /** "Prima parte a zilei" — no clock hours (2026-11-19, founder fact-check). */
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
    /** 9 cells in 3×3 rotated grid — product photo mosaic. */
    cells: HeroCell[];
  };
  tools: {
    eyebrow: string;
    h2Line1: string;
    /** Rendered with <em>. */
    h2Em: string;
    intro: string;
    /** 7 tools (2026-10-15: "Set unelte de mână" removed; 2026-11-19: CNC
        router + laser engraving added, founder fact-check). */
    items: [Tool, Tool, Tool, Tool, Tool, Tool, Tool];
  };
  place: {
    eyebrow: string;
    h2Line1: string;
    h2Em: string;
    /** Trailing period or word after em, if any. */
    paragraphs: [string, string];
    /** Alt texts for the two stacked photos (stock — detail shots on purpose,
        never a wide shot: the copy describes OUR space, a stock wide shot
        of someone else's workshop would visibly contradict it). */
    imageTopAlt: string;
    imageBottomAlt: string;
  };
  /** Discreet caption under stock photo groups (2026-11-19, founder). */
  photoNote: string;
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
    items: ArticleCard[];
  };
  cta: {
    h2Line1: string;
    h2Em: string;
    /** Single button → /tocatoare (ghost waitlist button removed 2026-10-15). */
    primaryLabel: string;
  };
}

const ro: AtelierContent = {
  nav: { link: 'Atelier' },
  meta: {
    title: 'Atelierul Oak Fantasy — Cum se face fiecare tocător',
    // 138 chars
    description:
      'Atelier în vestul României. Stejar românesc, uscat până devine stabil. Uneltele noastre și cum lucrăm fiecare tocător — de la lemn la ulei alimentar.',
  },
  hero: {
    eyebrow: 'Documentar · Atelier',
    h1Line1: 'Un atelier în vestul României.',
    h1Line2Em: 'Și o singură regulă:',
    h1Line2Tail: 'nu grăbim lemnul.',
    sub: 'Un loc și uneltele lui · Atelier Oak Fantasy',
    readTime: 'Citește în ~7 minute',
    // Order chosen for silhouette rhythm in the 3×3 (rectangular / long /
    // square / free-form alternate). OF-07 (frasin-stejar 300 mm) left out:
    // at ~150px its three-tone stripes and oval handle read as noise, while
    // OF-08 (same size) has clear dark/light contrast.
    cells: [
      { src: '/products/atelier-tocator-taur-alb.webp', alt: 'Tocător din stejar și frasin cu taur frezat, contur alb' },
      { src: '/products/atelier-platou-lung-servire.webp', alt: 'Platou lung din stejar cu margine naturală' },
      { src: '/products/atelier-ceas-custom-cerb.webp', alt: 'Ceas de perete din stejar, model cerb gravat' },
      { src: '/products/atelier-tava-servire-premium.webp', alt: 'Tavă de servire cu model valuri și mânere metalice' },
      { src: '/products/atelier-tocator-taur-negru.webp', alt: 'Tocător din stejar cu taur frezat, contur negru' },
      { src: '/products/atelier-model-custom-neregulat.webp', alt: 'Tocător din stejar cu formă neregulată' },
      { src: '/products/atelier-tocator-platou-model-peste.webp', alt: 'Platou din stejar cu pește frezat' },
      { src: '/products/atelier-tocator-model-love.webp', alt: 'Tocător din stejar, model îndrăgostiți' },
      { src: '/products/atelier-model-compus-stejar-frasin.webp', alt: 'Tocător din stejar și frasin cu mâner lateral' },
    ],
  },
  tools: {
    eyebrow: 'Cu ce lucrăm',
    h2Line1: 'Catalogul',
    h2Em: 'uneltelor',
    intro:
      'Nu sunt multe unelte într-un atelier care face tocătoare. Sunt cele potrivite. Fiecare cu rolul ei, fiecare aleasă cu motiv. Mai jos sunt câteva dintre ele, în ordinea în care intră în lucru.',
    items: [
      {
        tag: 'Tăiere',
        name: 'Ferăstrău circular de masă',
        role: 'Unealta cu care începe orice tocător.',
        desc: 'Taie scândurile la dimensiuni precise. Pentru tăieri repetate la aceeași dimensiune, nu există ceva mai bun.',
        image: '/stock/atelier-tool-circular-saw.webp',
        imageAlt: 'Pânză de fierăstrău circular tăind o scândură de stejar',
      },
      {
        tag: 'Margine',
        name: 'Freză verticală cu ghidaj',
        role: 'Marginile plăcute la atingere, nu tăioase.',
        desc: 'Pentru rotunjirea marginilor și mânerelor. Bity de 6mm și 12mm, R profile.',
        image: '/stock/atelier-tool-router.webp',
        imageAlt: 'Mână ghidând o placă de stejar prin freză',
      },
      {
        tag: 'Asamblare',
        name: 'Presă manuală cu șuruburi',
        role: '24 de ore, niciodată mai puțin.',
        desc: 'Pentru lipirea plăcilor în bloc, cu presiune uniformă.',
        image: '/stock/atelier-tool-clamps.webp',
        imageAlt: 'Prese cu șuruburi strângând plăci de lemn la lipire',
      },
      {
        tag: 'Aplatizare',
        name: 'Rindea electrică',
        role: 'Suprafețe perfect plane după lipire.',
        desc: 'Tăieri subțiri, pe direcția fibrei, până când blocul e perfect plan.',
        image: '/stock/atelier-tool-hand-planer.webp',
        imageAlt: 'Rindea electrică de mână trecută peste un bloc de lemn, cu rumeguș în aer',
      },
      {
        tag: 'Desen',
        name: 'Freză CNC',
        role: 'Desenele de pe tocătoare.',
        desc: 'Taurul, peștele, cerbul, inima cu îndrăgostiții: le frezăm pe CNC, după desen. Tăierea, lipirea, șlefuirea și uleiul le facem noi, în atelier.',
        image: '/stock/atelier-tool-cnc.webp',
        imageAlt: 'Capul unei freze CNC tăind într-o placă de lemn, cu așchii în aer',
      },
      {
        tag: 'Șlefuit',
        name: 'Șlefuitor orbital',
        role: 'De la 80 la 320. Fără apăsare, fără grabă.',
        desc: 'Patru-cinci graduri de hârtie abrazivă. Mișcare circulară, fără apăsare, fără grabă.',
        image: '/stock/atelier-tool-sander.webp',
        imageAlt: 'Șlefuitor orbital pe o placă de stejar',
      },
      {
        tag: 'Personalizare',
        name: 'Gravare laser',
        role: 'Nume, date, desene.',
        desc: 'Pentru comenzile personalizate: nume, date, rețete, desene sau sigle, gravate direct în lemn.',
        image: '/stock/atelier-tool-laser.webp',
        imageAlt: 'Capul unui gravor laser deasupra unui bloc de lemn cu litere gravate',
      },
    ],
  },
  place: {
    eyebrow: 'Atelierul ca loc',
    h2Line1: 'Locul unde se face',
    h2Em: 'treaba.',
    paragraphs: [
      'Atelierul nostru e în vestul României, unde tâmplăria are rădăcini vechi. Are lumină naturală bună până pe la patru după-amiaza, apoi aprindem lămpile.',
      'Miroase a stejar — un miros dulce, ușor acrișor, care se ține în haine și în păr. Pe podea e rumeguș, pe degete rămâne ulei. Sunetul depinde de ce facem: unele unelte sunt zgomotoase, altele lucrează aproape în liniște.',
    ],
    imageTopAlt: 'Banc de lucru vechi lângă o fereastră, în lumină naturală',
    imageBottomAlt: 'Așchii de lemn și creioane pe un blat de lucru',
  },
  photoNote: 'Fotografii ilustrative.',
  day: {
    eyebrow: 'O zi în atelier',
    h2Line1: 'Ritmul',
    h2Em: 'unei zile.',
    // 2026-11-19 (founder fact-check): no clock hours, no instruments, no
    // claims about our routine beyond the general order the wood asks for.
    intro:
      'Nu există două zile identice — depinde de ce lucrăm, de etapa la care suntem, de vreme. Dar ordinea lucrurilor e cam aceeași, pentru că așa o cere lemnul.',
    moments: [
      {
        time: 'Prima parte a zilei',
        title: 'Muncă grea',
        body: 'Tăieri și lipiri — treaba care cere forță și precizie, cât mintea e proaspătă. Piesele lipite intră la presă și rămân acolo 24 de ore.',
      },
      {
        time: 'Pauza',
        title: 'O cafea, o respirație',
        body: 'O cafea, o gustare, o respirație. Lemnul lipit stă la presă; nu-l grăbim.',
      },
      {
        time: 'După-amiaza',
        title: 'Lucrări de finețe',
        body: 'Șlefuit, frezat margini, gravare când avem comenzi personalizate. Treaba care cere ochi atent o facem cât e lumină naturală bună.',
      },
      {
        time: 'Spre seară',
        title: 'Finisaj și închidere',
        body: 'Ulei alimentar pe piesele terminate, ambalare pentru comenzile gata, ordine în atelier pentru a doua zi.',
      },
    ],
  },
  pullquote: 'Lucrăm fără grabă. Fiecare tocător primește timpul de care are nevoie.',
  process: {
    eyebrow: 'Procesul în sumar',
    h2Line1: 'Cinci pași,',
    h2Em: 'foarte pe scurt.',
    intro:
      'Procesul detaliat — cu mărimile, uneltele și timpii — e descris pe pagina noastră despre. Aici e versiunea scurtă, pentru context.',
    steps: [
      { n: 'i.',   title: 'Alegerea lemnului',      body: 'Stejar cu desen frumos. Restul îl folosim altfel.' },
      { n: 'ii.',  title: 'Uscarea',                body: 'Până devine stabil, în echilibru cu aerul din jur.' },
      { n: 'iii.', title: 'Tăierea și asamblarea', body: 'Dimensiuni precise, adeziv alimentar, presare 24 de ore.' },
      { n: 'iv.',  title: 'Șlefuirea',              body: 'Patru-cinci graduri, de la 80 la 320.' },
      { n: 'v.',   title: 'Finisajul',              body: 'Ulei alimentar, strat după strat.' },
    ],
    crossLinkLabel: 'Detalii complete pe pagina Despre',
  },
  conditions: {
    eyebrow: 'Condițiile',
    h2Line1: 'Lucruri pe care',
    h2Em: 'nu le vezi,',
    h2Tail: 'dar contează.',
    // 2026-11-19 (founder fact-check): general, true wood behaviour — no
    // instruments, ranges or storage set-up claimed for our workshop.
    intro:
      'Două lucruri care nu se văd, dar fac diferența între un tocător care durează zeci de ani și unul care plesnește în primele luni.',
    cards: [
      {
        label: 'Umiditatea aerului',
        body: 'Lemnul e un material viu: schimbă apă cu aerul din jur până ajunge la echilibru cu el. Sub **40%** umiditate, își pierde apa proprie și începe să crape. Peste **60%**, absoarbe apă din aer și se umflă.',
      },
      {
        label: 'Lemn uscat, lemn stabil',
        body: 'Lemnul se lucrează după ce s-a uscat și s-a stabilizat. Cel neuscat cum trebuie continuă să se miște și după ce devine tocător: **se strâmbă** sau **crapă** în primele luni.',
      },
    ],
  },
  seasonality: {
    eyebrow: 'Sezonalitatea',
    h2Line1: 'Vremea',
    h2Em: 'schimbă',
    h2Tail: 'lemnul.',
    cards: [
      { title: 'Iarna',     body: 'Aerul încălzit din case e uscat, iar lemnul pierde din apă și se strânge. De-asta un tocător nu stă lângă calorifer sau sobă.' },
      { title: 'Primăvara', body: 'Primim lemn nou de la furnizori, care intră la uscat. Umiditatea aerului crește, iar lemnul o simte.' },
      { title: 'Vara',      body: 'Aerul cald și umed face lemnul să se umfle ușor. Un tocător șters după spălare și uns la timp cu ulei trece ușor peste vară.' },
      { title: 'Toamna',    body: 'Pornesc caloriferele și aerul din casă începe să se usuce. E un moment bun pentru o trecere cu ulei.' },
    ],
  },
  articles: {
    eyebrow: 'Articole conexe',
    h2Line1: 'Mai multe despre',
    h2Em: 'meserie.',
    intro:
      'Articole care explică în detaliu părți specifice din ce facem. Vor fi disponibile când publicăm secțiunea noastră de blog.',
    items: [
      { topic: 'Tehnică · Uscare',      title: 'De ce uscăm lemnul — știința umidității',                           meta: 'Articol în pregătire' },
      { topic: 'Finisaj',                title: 'Uleiul alimentar — finisajul tradițional pentru lemnul de bucătărie', meta: 'Articol în pregătire' },
      { topic: 'Ghid',                   title: 'Cum alegi mărimea potrivită pentru bucătăria ta',                    meta: 'Articol în pregătire' },
    ],
  },
  cta: {
    h2Line1: 'Ai văzut uneltele.',
    h2Em: 'Hai să vezi și tocătoarele.',
    primaryLabel: 'Vezi tocătoarele noastre',
  },
};

const en: AtelierContent = {
  nav: { link: 'Workshop' },
  meta: {
    title: 'Oak Fantasy Workshop — How every cutting board is made',
    // 142 chars
    description:
      'A workshop in western Romania. Romanian oak, dried until stable. Our tools and how we make every cutting board — from wood to food-safe oil.',
  },
  hero: {
    eyebrow: 'Documentary · Workshop',
    h1Line1: 'A workshop in western Romania.',
    h1Line2Em: 'And one rule:',
    h1Line2Tail: "we don't rush the wood.",
    sub: 'One place and its tools · Oak Fantasy Workshop',
    readTime: 'Read in ~7 minutes',
    cells: [
      { src: '/products/atelier-tocator-taur-alb.webp', alt: 'Oak and ash cutting board with a carved bull, white outline' },
      { src: '/products/atelier-platou-lung-servire.webp', alt: 'Long live-edge oak serving board' },
      { src: '/products/atelier-ceas-custom-cerb.webp', alt: 'Oak wall clock with an engraved stag' },
      { src: '/products/atelier-tava-servire-premium.webp', alt: 'Serving tray with a wave pattern and metal handles' },
      { src: '/products/atelier-tocator-taur-negru.webp', alt: 'Oak cutting board with a carved bull, black outline' },
      { src: '/products/atelier-model-custom-neregulat.webp', alt: 'Free-form oak cutting board' },
      { src: '/products/atelier-tocator-platou-model-peste.webp', alt: 'Oak board with a carved fish' },
      { src: '/products/atelier-tocator-model-love.webp', alt: 'Oak cutting board, lovers model' },
      { src: '/products/atelier-model-compus-stejar-frasin.webp', alt: 'Oak and ash cutting board with a side handle' },
    ],
  },
  tools: {
    eyebrow: 'What we work with',
    h2Line1: 'The catalog of our',
    h2Em: 'tools.',
    intro:
      "There aren't many tools in a workshop that makes cutting boards. There are the right ones. Each with its role, each chosen for a reason. Below are some of them, in the order they come into work.",
    items: [
      {
        tag: 'Cutting',
        name: 'Table saw',
        role: 'The tool every cutting board starts with.',
        desc: "Cuts boards to precise dimensions. For repeated cuts at the same size, nothing's better.",
        image: '/stock/atelier-tool-circular-saw.webp',
        imageAlt: 'Circular saw blade cutting an oak board',
      },
      {
        tag: 'Edge',
        name: 'Plunge router with edge guide',
        role: 'Edges pleasant to touch, not sharp.',
        desc: 'For rounding edges and handles. 6mm and 12mm bits, R profile.',
        image: '/stock/atelier-tool-router.webp',
        imageAlt: 'Hand guiding an oak board through a router',
      },
      {
        tag: 'Assembly',
        name: 'Manual screw clamps',
        role: '24 hours, never less.',
        desc: 'For glueing planks into a block, with uniform pressure.',
        image: '/stock/atelier-tool-clamps.webp',
        imageAlt: 'Screw clamps holding glued wood boards',
      },
      {
        tag: 'Flattening',
        name: 'Electric hand planer',
        role: 'Perfectly flat surfaces after glueing.',
        desc: 'Thin cuts, along the grain, until the block is perfectly flat.',
        image: '/stock/atelier-tool-hand-planer.webp',
        imageAlt: 'Electric hand planer passing over a wooden block, with shavings in the air',
      },
      {
        tag: 'Design',
        name: 'CNC router',
        role: 'The designs on our boards.',
        desc: 'The bull, the fish, the stag, the heart with the lovers: we CNC-carve them from a drawing. The cutting, gluing, sanding and oiling we do ourselves, in the workshop.',
        image: '/stock/atelier-tool-cnc.webp',
        imageAlt: 'CNC router head cutting into a wooden board, with chips in the air',
      },
      {
        tag: 'Sanding',
        name: 'Orbital sander',
        role: 'From 80 to 320. No pressure, no rush.',
        desc: 'Four-five grits of sandpaper. Circular motion, no pressure, no rush.',
        image: '/stock/atelier-tool-sander.webp',
        imageAlt: 'Orbital sander on an oak board',
      },
      {
        tag: 'Personalisation',
        name: 'Laser engraving',
        role: 'Names, dates, drawings.',
        desc: 'For custom orders: names, dates, recipes, drawings or logos, engraved straight into the wood.',
        image: '/stock/atelier-tool-laser.webp',
        imageAlt: 'Laser engraver head above a wooden block with engraved letters',
      },
    ],
  },
  place: {
    eyebrow: 'The workshop as a place',
    // Batch A fix: the EN heading was left mid-sentence ("The place where the
    // work") — RO source of truth is "Locul unde se face treaba."
    h2Line1: 'The place where the work',
    h2Em: 'gets done.',
    paragraphs: [
      'Our workshop is in western Romania, where woodworking runs old and deep. It has good natural light until around four in the afternoon, then we turn on the lamps.',
      'It smells of oak — a sweet, slightly tart smell that clings to clothes and hair. There is sawdust on the floor and oil on our fingers. The sound depends on what we are doing: some tools are loud, others work almost in silence.',
    ],
    imageTopAlt: 'Old workbench by a window, in natural light',
    imageBottomAlt: 'Wood shavings and pencils on a worktop',
  },
  photoNote: 'Illustrative photos.',
  day: {
    eyebrow: 'A day in the workshop',
    h2Line1: 'The rhythm of',
    h2Em: 'a day.',
    intro:
      "No two days are alike — it depends on what we're working on, what stage we're at, the weather. But the order of things is about the same, because the wood asks for it.",
    moments: [
      {
        time: 'Early in the day',
        title: 'Heavy work',
        body: 'Cutting and gluing — the work that takes strength and precision, while the mind is fresh. Glued pieces go into the clamps and stay there for 24 hours.',
      },
      {
        time: 'The break',
        title: 'A coffee, a breath',
        body: 'A coffee, a snack, a breath. The glued wood stays in the clamps; we don’t rush it.',
      },
      {
        time: 'Afternoon',
        title: 'Fine work',
        body: 'Sanding, edge routing, engraving when we have custom orders. The work that needs a careful eye we do while the natural light is good.',
      },
      {
        time: 'Towards evening',
        title: 'Finishing and closing',
        body: 'Food-safe oil on the finished pieces, packing the orders that are ready, tidying the workshop for the next day.',
      },
    ],
  },
  pullquote: 'We work without rushing. Every board gets the time it needs.',
  process: {
    eyebrow: 'The process in summary',
    h2Line1: 'Five steps,',
    h2Em: 'very briefly.',
    intro:
      "The detailed process — with measurements, tools, and timings — is described on our about page. Here's the short version, for context.",
    steps: [
      { n: 'i.',   title: 'Choosing the wood',    body: 'Oak with beautiful grain. The rest we use otherwise.' },
      { n: 'ii.',  title: 'Drying',                body: 'Until it is stable, in balance with the air around it.' },
      { n: 'iii.', title: 'Cutting and assembly', body: 'Precise dimensions, food-safe adhesive, 24-hour clamping.' },
      { n: 'iv.',  title: 'Sanding',               body: 'Four-five grits, from 80 to 320.' },
      { n: 'v.',   title: 'Finishing',             body: 'Food-safe oil, layer after layer.' },
    ],
    crossLinkLabel: 'Full details on the About page',
  },
  conditions: {
    eyebrow: 'The conditions',
    h2Line1: 'Things you',
    h2Em: "don't see,",
    h2Tail: 'but matter.',
    intro:
      "Two things you don't see that make the difference between a cutting board that lasts decades and one that cracks in the first months.",
    cards: [
      {
        label: 'Air humidity',
        body: 'Wood is a living material: it trades water with the air around it until it reaches balance. Below **40%** humidity, it loses its own water and starts to crack. Above **60%**, it absorbs water from the air and swells.',
      },
      {
        label: 'Dry wood, stable wood',
        body: "Wood is worked once it has dried and settled. Wood that hasn't dried properly keeps moving after it becomes a board: it **warps** or **cracks** in the first months.",
      },
    ],
  },
  seasonality: {
    eyebrow: 'The seasons',
    h2Line1: 'The weather',
    h2Em: 'changes',
    h2Tail: 'the wood.',
    cards: [
      { title: 'Winter', body: 'Heated indoor air is dry, so wood loses water and shrinks. That is why a board shouldn’t sit next to a radiator or a stove.' },
      { title: 'Spring', body: 'We receive new wood from suppliers, and it goes to dry. Air humidity rises, and the wood feels it.' },
      { title: 'Summer', body: 'Warm, humid air makes wood swell slightly. A board wiped dry after washing and oiled in time gets through summer easily.' },
      { title: 'Autumn', body: 'The heating comes on and indoor air starts to dry out. A good time to give the board a coat of oil.' },
    ],
  },
  articles: {
    eyebrow: 'Related articles',
    h2Line1: 'More about the',
    h2Em: 'craft.',
    intro:
      "Articles that explain in detail specific parts of what we do. They'll be available when we publish our blog section.",
    items: [
      { topic: 'Technique · Drying',       title: 'Why we dry wood — the science of humidity',                 meta: 'Article coming soon' },
      { topic: 'Finishing',                 title: 'Food-safe oil — the traditional finish for kitchen wood',  meta: 'Article coming soon' },
      { topic: 'Guide',                     title: 'How to choose the right size for your kitchen',                meta: 'Article coming soon' },
    ],
  },
  cta: {
    h2Line1: "You've seen the tools.",
    h2Em: "Now let's see the boards.",
    primaryLabel: 'See our cutting boards',
  },
};

export const ATELIER_CONTENT: Record<Locale, AtelierContent> = { ro, en };
