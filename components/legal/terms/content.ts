import type { Locale } from '@/lib/i18n-routes';

import { LEGAL_LAST_UPDATED, type LegalContent } from '../content';

// Terms and conditions — final text (2026-11-19). RO is the reference
// version; EN mirrors it section by section. Merchant data, contact details
// and shipping prices are tokens (see ../content.ts), never typed in.
// Facts confirmed by the founder at the 2026-11-19 gate: cash on delivery
// only; Romania only, courier unnamed; manual confirmation by phone/WhatsApp;
// 5–10 working days + 1–3 days in transit; refused COD parcel = cancelled at
// no cost; engraved orders cancellable free until engraving starts; 18+.

export const TERMS_CONTENT: Record<Locale, LegalContent> = {
  ro: {
    meta: {
      title: 'Termeni și condiții — Oak Fantasy',
      description:
        'Cum vindem pe oakfantasy.ro: comanda și confirmarea ei, plata ramburs, livrarea în România, retragerea, conformitatea produselor și lucrările la comandă.',
    },
    hero: {
      eyebrow: 'Termeni și condiții',
      title: 'Termeni și condiții',
      lastUpdated: LEGAL_LAST_UPDATED.ro,
      lastUpdatedLabel: 'Ultima actualizare',
    },
    intro:
      'Aici scrie, cât mai simplu, cum vindem tocătoarele și platourile Oak Fantasy: cum comanzi, cum plătești, cum livrăm și ce faci dacă ceva nu e în regulă. Plasând o comandă, ești de acord cu acești termeni. Dacă ceva nu e limpede, ne scrii la {email}.',
    tocLabel: 'Cuprins',
    sections: [
      {
        id: 'parties',
        title: 'Cine suntem',
        blocks: [
          {
            kind: 'p',
            text: 'Site-ul oakfantasy.ro și magazinul Oak Fantasy sunt operate de **{companyName}**, cu sediul social în {hqAddress}, înregistrată la Registrul Comerțului sub nr. {regCom}, CUI {cui}, capital social {capital}. Societatea nu este plătitoare de TVA.',
          },
          {
            kind: 'p',
            text: 'Oak Fantasy este marca sub care vindem produsele lucrate în atelierul nostru. În acești termeni, „noi” înseamnă {companyName}.',
          },
          {
            kind: 'p',
            text: 'Ne poți scrie la {email} sau ne poți suna la {phone} ({hours}). Cum folosim datele tale scrie în [politica de confidențialitate](route:privacy).',
          },
        ],
      },
      {
        id: 'definitions',
        title: 'Definiții',
        blocks: [
          {
            kind: 'list',
            ordered: false,
            items: [
              '**Site** – oakfantasy.ro, inclusiv versiunea în limba engleză.',
              '**Client** sau **tu** – persoana de cel puțin 18 ani care plasează o comandă sau ne trimite o cerere prin site.',
              '**Consumator** – clientul persoană fizică care cumpără în afara activității sale comerciale sau profesionale. Consumatorul are, în plus, drepturile din legislația privind protecția consumatorilor.',
              '**Produs standard** – un produs din catalog, fără gravură.',
              '**Produs personalizat** – un produs din catalog pe care îl gravăm cu textul ales de tine.',
              '**Lucrare la comandă** – o piesă pe care o facem după ideea ta, stabilită împreună cu tine pe WhatsApp, pornind de la formularul [La comandă](route:laComanda).',
              '**Comandă** – cererea de cumpărare pe care o trimiți prin coș și pagina de finalizare a comenzii.',
              '**Contract** – contractul de vânzare la distanță dintre tine și noi, încheiat cum scrie în secțiunea 5.',
            ],
          },
        ],
      },
      {
        id: 'account',
        title: 'Contul de client',
        blocks: [
          {
            kind: 'p',
            text: 'Contul este opțional. Poți comanda și fără cont.',
          },
          {
            kind: 'p',
            text: 'Pentru cont ai nevoie de nume, adresă de email și o parolă; telefonul e opțional. Când comanzi din cont, numele, emailul și telefonul se completează singure în formularul de comandă.',
          },
          {
            kind: 'p',
            text: 'Contul și comenzile sunt pentru persoane de cel puțin 18 ani.',
          },
          {
            kind: 'p',
            text: 'Tu răspunzi de păstrarea parolei. Dacă bănuiești că altcineva îți folosește contul, schimbă parola din „Ai uitat parola?” și scrie-ne. Putem închide un cont folosit pentru fraudă sau abuz.',
          },
          {
            kind: 'p',
            text: 'Poți cere oricând ștergerea contului, la {email}. Comenzile deja plasate rămân în evidența noastră cât timp ne obligă legea contabilă.',
          },
        ],
      },
      {
        id: 'products',
        title: 'Produsele',
        blocks: [
          {
            kind: 'p',
            text: 'Tocătoarele și platourile noastre sunt lucrate manual, în atelier, din lemn masiv. Pe pagina fiecărui produs găsești descrierea, dimensiunile și prețul.',
          },
          {
            kind: 'p',
            text: 'Lemnul e un material natural. Fibra, nuanța și nodurile diferă de la o piesă la alta, așa că piesa pe care o primești nu va fi identică cu cea din fotografii. Aceste variații naturale nu sunt defecte: sunt semnul că piesa e din lemn adevărat, lucrat de mână.',
          },
          {
            kind: 'p',
            text: 'La modelele care permit, poți adăuga o gravură cu textul tău. Prețul gravurii apare pe pagina produsului și în coș.',
          },
          {
            kind: 'p',
            text: 'Lucrăm fiecare comandă în 5–10 zile lucrătoare de la confirmare.',
          },
        ],
      },
      {
        id: 'ordering',
        title: 'Comanda și încheierea contractului',
        blocks: [
          {
            kind: 'list',
            ordered: true,
            items: [
              'Adaugi produsele în coș și completezi datele de livrare: nume, email, telefon și adresă.',
              'Verifici rezumatul comenzii, bifezi acordul cu acești termeni și apeși „Plasează comanda”.',
              'Primești un email automat că am primit comanda. Emailul confirmă doar primirea; nu înseamnă încă acceptarea comenzii.',
              'Te contactăm prin telefon sau pe WhatsApp, la numărul din comandă, ca să confirmăm comanda. **Contractul se încheie în momentul în care îți confirmăm comanda.**',
            ],
          },
          {
            kind: 'p',
            text: 'Dacă nu putem onora o comandă, de exemplu pentru că un produs nu mai e disponibil, te anunțăm și o anulăm, fără niciun cost pentru tine.',
          },
          {
            kind: 'p',
            text: 'Un produs standard îl poți anula oricând înainte de livrare, fără costuri: e o formă a dreptului tău de retragere (secțiunea 8). O comandă cu gravură o poți anula fără costuri până începem gravura; scrie-ne sau sună-ne cât mai repede după ce ai comandat.',
          },
          {
            kind: 'p',
            text: 'Verifică datele înainte să trimiți comanda. Dacă ai greșit ceva, scrie-ne sau spune-ne când te sunăm pentru confirmare.',
          },
          {
            kind: 'p',
            text: 'Contractul se încheie în limba în care ai plasat comanda, română sau engleză. Păstrăm comanda în evidența noastră și ți-o putem trimite la cerere.',
          },
        ],
      },
      {
        id: 'prices-payment',
        title: 'Prețuri și plată',
        blocks: [
          {
            kind: 'p',
            text: 'Prețurile sunt în lei (RON) și sunt finale. {companyName} nu este plătitoare de TVA, așa că nu adăugăm TVA la prețul afișat.',
          },
          {
            kind: 'p',
            text: 'Costul transportului apare separat în rezumatul comenzii, înainte să plasezi comanda (secțiunea 7).',
          },
          {
            kind: 'callout',
            title: 'Plata se face exclusiv ramburs',
            text: 'Plătești în numerar, curierului, când primești coletul. Deocamdată nu acceptăm plata cu cardul sau alte plăți online.',
          },
          {
            kind: 'p',
            text: 'Pentru lucrările la comandă, plata e tot ramburs, ca regulă; la lucrările mai mari putem cere un avans (secțiunea 10).',
          },
          {
            kind: 'p',
            text: 'Primești documentul fiscal aferent comenzii.',
          },
          {
            kind: 'p',
            text: 'Dacă un preț apare pe site greșit, dintr-o eroare evidentă, îți spunem când te contactăm pentru confirmare. Poți alege atunci să păstrezi comanda la prețul corect sau să renunți la ea, fără costuri.',
          },
        ],
      },
      {
        id: 'delivery',
        title: 'Livrarea',
        blocks: [
          {
            kind: 'p',
            text: 'Livrăm doar în România, prin firmă de curierat, la adresa din comandă.',
          },
          {
            kind: 'p',
            text: 'Transportul costă {shippingFee}. Pentru comenzile de la {freeShippingFrom} în sus, transportul e gratuit.',
          },
          {
            kind: 'p',
            text: 'Lucrăm comanda în 5–10 zile lucrătoare de la confirmare. După expediere, curierul o livrează de regulă în 1–3 zile lucrătoare. Dacă apare o întârziere, te anunțăm.',
          },
          {
            kind: 'p',
            text: 'Răspundem de produs până în momentul în care îl primești.',
          },
          {
            kind: 'p',
            text: 'Te rugăm să verifici coletul când îl primești. Dacă produsul e deteriorat, fă câteva poze și scrie-ne; pașii sunt în [politica de retur](route:returns).',
          },
          {
            kind: 'p',
            text: 'Dacă refuzi coletul la livrare, anulăm comanda, fără alte costuri pentru tine.',
          },
        ],
      },
      {
        id: 'right-of-withdrawal',
        title: 'Dreptul de retragere',
        blocks: [
          {
            kind: 'p',
            text: 'Dacă ești consumator, te poți retrage din contractul pentru un produs standard în 14 zile de la data la care îl primești, fără să ne spui motivul. Costul transportului de retur e al tău.',
          },
          {
            kind: 'callout',
            title: 'Produsele gravate și lucrările la comandă nu se pot returna',
            text: 'Dreptul de retragere nu se aplică produselor personalizate (gravate) și lucrărilor la comandă (OUG nr. 34/2014, art. 16 lit. c). Piesa poartă un nume, un mesaj sau o formă cerută de tine și nu o mai putem vinde altcuiva.',
          },
          {
            kind: 'p',
            text: 'Pașii, rambursarea banilor și formularul de retragere sunt în [politica de retur](route:returns).',
          },
        ],
      },
      {
        id: 'warranty',
        title: 'Conformitatea produselor',
        blocks: [
          {
            kind: 'p',
            text: 'Răspundem pentru conformitatea produselor, potrivit garanției legale de conformitate, timp de 2 ani de la livrare. Garanția legală se aplică tuturor produselor, inclusiv celor gravate și lucrărilor la comandă.',
          },
          {
            kind: 'p',
            text: 'Dacă primești un produs deteriorat, defect sau altul decât cel comandat, îl refacem, îl înlocuim sau îți dăm banii înapoi, pe costul nostru.',
          },
          {
            kind: 'p',
            text: 'Variațiile naturale ale lemnului nu sunt defecte. Garanția nu acoperă deteriorările apărute după livrare din folosirea sau întreținerea necorespunzătoare a produsului.',
          },
          {
            kind: 'p',
            text: 'Cum ne anunți și ce urmează scrie în [politica de retur](route:returns), la secțiunea „Produse deteriorate, defecte sau greșite”.',
          },
        ],
      },
      {
        id: 'custom-work',
        title: 'Lucrări la comandă',
        blocks: [
          {
            kind: 'list',
            ordered: true,
            items: [
              'Ne trimiți ideea prin formularul [La comandă](route:laComanda). Cererea nu este o comandă și nu te obligă la nimic.',
              'Te contactăm pe WhatsApp, la numărul lăsat în formular. Stabilim împreună detaliile, prețul și termenul. Costul livrării îl stabilim odată cu prețul.',
              'Contractul pentru o lucrare la comandă se încheie când ne înțelegem pe WhatsApp asupra detaliilor și a prețului.',
            ],
          },
          {
            kind: 'p',
            text: 'Plata se face ramburs, ca regulă. Pentru lucrările mai mari putem cere un avans prin transfer bancar, pe care îl stabilim pe WhatsApp înainte să începem lucrul. Dacă, din motive care țin de noi, nu mai putem face lucrarea, îți dăm avansul înapoi integral.',
          },
          {
            kind: 'p',
            text: 'O lucrare la comandă e făcută după indicațiile tale, așa că nu are drept de retragere (secțiunea 8). Garanția legală de conformitate rămâne: dacă piesa ajunge deteriorată sau nu e ce am stabilit, o rezolvăm pe costul nostru.',
          },
          {
            kind: 'p',
            text: 'Dacă ne trimiți un desen, un logo sau un text, ne confirmi că ai dreptul să-l folosești. Îl folosim doar pentru lucrarea ta.',
          },
        ],
      },
      {
        id: 'liability',
        title: 'Răspundere',
        blocks: [
          {
            kind: 'p',
            text: 'Răspundem pentru produsele pe care le vindem, potrivit legii. Nimic din acești termeni nu îți limitează drepturile pe care le ai ca consumator.',
          },
          {
            kind: 'p',
            text: 'Facem tot ce putem ca informațiile de pe site să fie corecte și site-ul să funcționeze. Se poate întâmpla ca site-ul să fie temporar indisponibil, de exemplu în timpul lucrărilor de întreținere.',
          },
          {
            kind: 'p',
            text: 'Linkurile către alte site-uri, de exemplu către rețelele sociale, duc la pagini pe care nu le controlăm.',
          },
        ],
      },
      {
        id: 'force-majeure',
        title: 'Forță majoră',
        blocks: [
          {
            kind: 'p',
            text: 'Nu răspundem pentru întârzieri sau pentru neexecutarea obligațiilor cauzate de forță majoră: un eveniment imprevizibil, de neînlăturat și independent de voința noastră, cum ar fi o calamitate naturală, un incendiu sau restricțiile impuse de autorități.',
          },
          {
            kind: 'p',
            text: 'Te anunțăm cât mai repede. Dacă situația se prelungește, oricare dintre noi poate renunța la contract, iar tu primești înapoi orice sumă plătită pentru produsele nelivrate.',
          },
        ],
      },
      {
        id: 'intellectual-property',
        title: 'Proprietate intelectuală',
        blocks: [
          {
            kind: 'p',
            text: 'Textele, fotografiile, logo-ul, marca Oak Fantasy și designul site-ului ne aparțin sau le folosim cu licență ori cu acordul autorilor. Nu le poți copia sau folosi în scop comercial fără acordul nostru scris.',
          },
        ],
      },
      {
        id: 'dispute-resolution',
        title: 'Lege aplicabilă și litigii',
        blocks: [
          {
            kind: 'p',
            text: 'Acești termeni și contractele încheiate prin site sunt guvernate de legea română.',
          },
          {
            kind: 'p',
            text: 'Dacă ai o nemulțumire, scrie-ne întâi la {email}. Încercăm să găsim împreună o soluție.',
          },
          {
            kind: 'p',
            text: 'Poți depune o reclamație la Autoritatea Națională pentru Protecția Consumatorilor ([ANPC](https://anpc.ro)) sau poți apela la [soluționarea alternativă a litigiilor (SAL)](https://anpc.ro/ce-este-sal/).',
          },
          {
            kind: 'p',
            text: 'Litigiile pe care nu le rezolvăm pe cale amiabilă sunt soluționate de instanțele competente din România.',
          },
        ],
      },
      {
        id: 'amendments',
        title: 'Modificarea termenilor',
        blocks: [
          {
            kind: 'p',
            text: 'Putem actualiza acești termeni; data ultimei actualizări e scrisă sus, pe pagină. Comenzii tale i se aplică termenii în vigoare în ziua în care ai plasat-o.',
          },
        ],
      },
    ],
    companyInfo: {
      sectionLabel: 'Datele comerciantului',
      labels: {
        operator: 'Comerciant',
        cui: 'CUI',
        regCom: 'Reg. Com.',
        sediu: 'Sediu social',
        contact: 'Contact',
      },
      placeholderBanner: 'Datele firmei vor fi actualizate înainte de lansare.',
    },
  },
  en: {
    meta: {
      title: 'Terms and Conditions — Oak Fantasy',
      description:
        'How we sell on oakfantasy.ro: ordering and order confirmation, cash on delivery, delivery within Romania, withdrawal, product conformity and custom work.',
    },
    hero: {
      eyebrow: 'Terms and conditions',
      title: 'Terms and conditions',
      lastUpdated: LEGAL_LAST_UPDATED.en,
      lastUpdatedLabel: 'Last updated',
    },
    intro:
      'This page explains, as simply as we can, how we sell Oak Fantasy cutting boards and serving boards: how you order, how you pay, how we deliver and what to do if something is wrong. By placing an order you agree to these terms. The Romanian version is the reference version. If anything is unclear, write to us at {email}.',
    tocLabel: 'Contents',
    sections: [
      {
        id: 'parties',
        title: 'Who we are',
        blocks: [
          {
            kind: 'p',
            text: 'The oakfantasy.ro website and the Oak Fantasy shop are operated by **{companyName}**, registered office {hqAddress}, Trade Register no. {regCom}, tax ID (CUI) {cui}, share capital {capital}. The company is not registered for VAT.',
          },
          {
            kind: 'p',
            text: 'Oak Fantasy is the brand under which we sell the pieces made in our workshop. In these terms, “we” means {companyName}.',
          },
          {
            kind: 'p',
            text: 'You can write to us at {email} or call {phone} ({hours}). How we use your data is explained in our [privacy policy](route:privacy).',
          },
        ],
      },
      {
        id: 'definitions',
        title: 'Definitions',
        blocks: [
          {
            kind: 'list',
            ordered: false,
            items: [
              '**Site** – oakfantasy.ro, including its English version.',
              '**Customer** or **you** – a person aged 18 or over who places an order or sends us a request through the site.',
              '**Consumer** – a customer who is a natural person buying outside their trade or profession. Consumers also have the rights given by consumer protection law.',
              '**Standard product** – a catalogue product without engraving.',
              '**Personalised product** – a catalogue product we engrave with the text you choose.',
              '**Custom work** – a piece we make from your idea, agreed with you on WhatsApp, starting from the [custom orders](route:laComanda) form.',
              '**Order** – the purchase request you send through the cart and the checkout page.',
              '**Contract** – the distance sales contract between you and us, concluded as described in section 5.',
            ],
          },
        ],
      },
      {
        id: 'account',
        title: 'Customer account',
        blocks: [
          {
            kind: 'p',
            text: 'An account is optional. You can also order without one.',
          },
          {
            kind: 'p',
            text: 'For an account you need your name, an email address and a password; a phone number is optional. When you order while signed in, your name, email and phone are filled in for you on the order form.',
          },
          {
            kind: 'p',
            text: 'Accounts and orders are for people aged 18 or over.',
          },
          {
            kind: 'p',
            text: 'You are responsible for keeping your password safe. If you think someone else is using your account, change your password through “Forgot password?” and write to us. We may close an account used for fraud or abuse.',
          },
          {
            kind: 'p',
            text: 'You can ask us to delete your account at any time, at {email}. Orders already placed stay in our records for as long as accounting law requires.',
          },
        ],
      },
      {
        id: 'products',
        title: 'Products',
        blocks: [
          {
            kind: 'p',
            text: 'Our cutting boards and serving boards are made by hand, in our workshop, from solid wood. Each product page shows the description, dimensions and price.',
          },
          {
            kind: 'p',
            text: 'Wood is a natural material. Grain, shade and knots differ from one piece to the next, so the piece you receive will not be identical to the one in the photos. These natural variations are not defects: they show the piece is real wood, made by hand.',
          },
          {
            kind: 'p',
            text: 'On the models that allow it, you can add an engraving with your own text. The engraving price is shown on the product page and in the cart.',
          },
          {
            kind: 'p',
            text: 'We make each order in 5–10 working days from confirmation.',
          },
        ],
      },
      {
        id: 'ordering',
        title: 'Ordering and conclusion of the contract',
        blocks: [
          {
            kind: 'list',
            ordered: true,
            items: [
              'You add products to the cart and fill in your delivery details: name, email, phone and address.',
              'You check the order summary, tick the box accepting these terms and press “Place order”.',
              'You receive an automatic email saying we have received the order. This email only confirms receipt; it does not yet mean we accept the order.',
              'We contact you by phone or on WhatsApp, at the number in the order, to confirm it. **The contract is concluded when we confirm your order.**',
            ],
          },
          {
            kind: 'p',
            text: 'If we cannot fulfil an order, for example because a product is no longer available, we tell you and cancel it, at no cost to you.',
          },
          {
            kind: 'p',
            text: 'You can cancel a standard product at any time before delivery, at no cost: this is a form of your right of withdrawal (section 8). An order with engraving can be cancelled at no cost until we start engraving; write to us or call us as soon as possible after ordering.',
          },
          {
            kind: 'p',
            text: 'Please check your details before sending the order. If something is wrong, write to us or tell us when we call to confirm.',
          },
          {
            kind: 'p',
            text: 'The contract is concluded in the language in which you placed the order, Romanian or English. We keep the order in our records and can send it to you on request.',
          },
        ],
      },
      {
        id: 'prices-payment',
        title: 'Prices and payment',
        blocks: [
          {
            kind: 'p',
            text: 'Prices are in Romanian lei (RON) and are final. {companyName} is not registered for VAT, so no VAT is added to the price shown.',
          },
          {
            kind: 'p',
            text: 'The delivery cost is shown separately in the order summary, before you place the order (section 7).',
          },
          {
            kind: 'callout',
            title: 'Payment is cash on delivery only',
            text: 'You pay the courier in cash when the parcel arrives. For now we do not accept card payments or other online payments.',
          },
          {
            kind: 'p',
            text: 'Custom work is also paid cash on delivery as a rule; for larger pieces we may ask for a deposit (section 10).',
          },
          {
            kind: 'p',
            text: 'You receive the tax document for your order.',
          },
          {
            kind: 'p',
            text: 'If a price on the site is wrong because of an obvious error, we tell you when we contact you to confirm. You can then keep the order at the correct price or cancel it, at no cost.',
          },
        ],
      },
      {
        id: 'delivery',
        title: 'Delivery',
        blocks: [
          {
            kind: 'p',
            text: 'We deliver only within Romania, by courier, to the address in the order.',
          },
          {
            kind: 'p',
            text: 'Delivery costs {shippingFee}. Orders of {freeShippingFrom} or more ship free.',
          },
          {
            kind: 'p',
            text: 'We make your order in 5–10 working days from confirmation. Once shipped, the courier usually delivers it in 1–3 working days. If there is a delay, we let you know.',
          },
          {
            kind: 'p',
            text: 'We are responsible for the product until you receive it.',
          },
          {
            kind: 'p',
            text: 'Please check the parcel when it arrives. If the product is damaged, take a few photos and write to us; the steps are in our [returns policy](route:returns).',
          },
          {
            kind: 'p',
            text: 'If you refuse the parcel on delivery, we cancel the order, at no further cost to you.',
          },
        ],
      },
      {
        id: 'right-of-withdrawal',
        title: 'Right of withdrawal',
        blocks: [
          {
            kind: 'p',
            text: 'If you are a consumer, you can withdraw from the contract for a standard product within 14 days of receiving it, without giving a reason. You pay the cost of returning it.',
          },
          {
            kind: 'callout',
            title: 'Engraved products and custom work cannot be returned',
            text: 'The right of withdrawal does not apply to personalised (engraved) products or to custom work (Romanian Government Emergency Ordinance no. 34/2014, art. 16(c)). The piece carries a name, a message or a shape you asked for, and we cannot sell it to anyone else.',
          },
          {
            kind: 'p',
            text: 'The steps, the refund and the withdrawal form are in our [returns policy](route:returns).',
          },
        ],
      },
      {
        id: 'warranty',
        title: 'Product conformity',
        blocks: [
          {
            kind: 'p',
            text: 'We are responsible for the conformity of our products under the legal guarantee of conformity, for 2 years from delivery. The legal guarantee covers every product, including engraved products and custom work.',
          },
          {
            kind: 'p',
            text: 'If you receive a product that is damaged, faulty or not the one you ordered, we remake it, replace it or refund you, at our cost.',
          },
          {
            kind: 'p',
            text: 'Natural variations in the wood are not defects. The guarantee does not cover damage that appears after delivery because of improper use or care.',
          },
          {
            kind: 'p',
            text: 'How to tell us and what happens next is in our [returns policy](route:returns), under “Damaged, faulty or wrong products”.',
          },
        ],
      },
      {
        id: 'custom-work',
        title: 'Custom work',
        blocks: [
          {
            kind: 'list',
            ordered: true,
            items: [
              'You send us your idea through the [custom orders](route:laComanda) form. The request is not an order and does not commit you to anything.',
              'We contact you on WhatsApp, at the number you left in the form. Together we agree the details, the price and the timing. The delivery cost is agreed together with the price.',
              'The contract for custom work is concluded when we agree the details and the price on WhatsApp.',
            ],
          },
          {
            kind: 'p',
            text: 'Payment is cash on delivery as a rule. For larger pieces we may ask for a deposit by bank transfer, agreed on WhatsApp before we start work. If, for reasons on our side, we can no longer make the piece, we refund the deposit in full.',
          },
          {
            kind: 'p',
            text: 'Custom work is made to your specifications, so it has no right of withdrawal (section 8). The legal guarantee of conformity still applies: if the piece arrives damaged or is not what we agreed, we put it right at our cost.',
          },
          {
            kind: 'p',
            text: 'If you send us a drawing, a logo or a text, you confirm that you have the right to use it. We use it only for your piece.',
          },
        ],
      },
      {
        id: 'liability',
        title: 'Liability',
        blocks: [
          {
            kind: 'p',
            text: 'We are responsible for the products we sell, as the law provides. Nothing in these terms limits your rights as a consumer.',
          },
          {
            kind: 'p',
            text: 'We do our best to keep the information on the site correct and the site working. The site may occasionally be unavailable, for example during maintenance.',
          },
          {
            kind: 'p',
            text: 'Links to other sites, such as social networks, lead to pages we do not control.',
          },
        ],
      },
      {
        id: 'force-majeure',
        title: 'Force majeure',
        blocks: [
          {
            kind: 'p',
            text: 'We are not liable for delays or for failing to perform our obligations because of force majeure: an unforeseeable, unavoidable event beyond our control, such as a natural disaster, a fire or restrictions imposed by the authorities.',
          },
          {
            kind: 'p',
            text: 'We let you know as soon as possible. If the situation goes on, either of us may end the contract, and you get back any amount paid for products not delivered.',
          },
        ],
      },
      {
        id: 'intellectual-property',
        title: 'Intellectual property',
        blocks: [
          {
            kind: 'p',
            text: 'The texts, photos, logo, the Oak Fantasy brand and the design of the site belong to us or are used under licence or with their authors’ permission. You may not copy them or use them commercially without our written consent.',
          },
        ],
      },
      {
        id: 'dispute-resolution',
        title: 'Governing law and disputes',
        blocks: [
          {
            kind: 'p',
            text: 'These terms and the contracts concluded through the site are governed by Romanian law.',
          },
          {
            kind: 'p',
            text: 'If you are unhappy with something, please write to us first at {email}. We will try to find a solution together.',
          },
          {
            kind: 'p',
            text: 'You can file a complaint with the Romanian National Authority for Consumer Protection ([ANPC](https://anpc.ro)) or use [alternative dispute resolution (SAL)](https://anpc.ro/ce-este-sal/).',
          },
          {
            kind: 'p',
            text: 'Disputes we cannot settle amicably are decided by the competent courts in Romania.',
          },
        ],
      },
      {
        id: 'amendments',
        title: 'Changes to these terms',
        blocks: [
          {
            kind: 'p',
            text: 'We may update these terms; the date of the last update is shown at the top of the page. Your order is governed by the terms in force on the day you placed it.',
          },
        ],
      },
    ],
    companyInfo: {
      sectionLabel: 'Merchant details',
      labels: {
        operator: 'Merchant',
        cui: 'Tax ID',
        regCom: 'Reg. Com.',
        sediu: 'Registered office',
        contact: 'Contact',
      },
      placeholderBanner: 'Company details will be updated before launch.',
    },
  },
};
