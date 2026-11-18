import type { Locale } from '@/lib/i18n-routes';

import { LEGAL_LAST_UPDATED, type LegalContent } from '../content';

// Returns policy — final text (2026-11-19). RO is the reference version.
// Founder decisions at the gate: the return address is sent by email after
// the withdrawal request (the workshop address stays private); refunds for
// cash-on-delivery orders go by bank transfer to the IBAN the customer gives
// in the request (giving it = agreeing to that refund method) within 14 days,
// and may wait until the product is back. Damaged / faulty / wrong products
// are put right at our cost for EVERY product, engraved and custom included.
// The annex follows the model withdrawal form of OUG 34/2014 (annex 2).

export const RETURNS_CONTENT: Record<Locale, LegalContent> = {
  ro: {
    meta: {
      title: 'Politica de retur — Oak Fantasy',
      description:
        'Cum returnezi un produs Oak Fantasy: retragerea în 14 zile, excepția pentru produsele gravate și lucrările la comandă, produse deteriorate, rambursarea banilor și formularul de retragere.',
    },
    hero: {
      eyebrow: 'Politica de retur',
      title: 'Politica de retur',
      lastUpdated: LEGAL_LAST_UPDATED.ro,
      lastUpdatedLabel: 'Ultima actualizare',
    },
    intro:
      'Aici găsești ce faci dacă te răzgândești sau dacă un produs nu ajunge cum trebuie. Pentru orice retur, primul pas e același: ne scrii la {email}.',
    tocLabel: 'Cuprins',
    sections: [
      {
        id: 'summary',
        title: 'Pe scurt',
        blocks: [
          {
            kind: 'callout',
            title: 'Produse standard: 14 zile, fără motiv',
            text: 'Te poți retrage în 14 zile de la primire, fără să ne spui de ce. Transportul de retur îl plătești tu.',
          },
          {
            kind: 'callout',
            title: 'Produse gravate și lucrări la comandă: fără retur',
            text: 'Sunt făcute pentru tine, așa că nu le putem primi înapoi doar pentru că te-ai răzgândit.',
          },
          {
            kind: 'callout',
            title: 'Produse deteriorate, defecte sau greșite: le rezolvăm noi',
            text: 'Le refacem, le înlocuim sau îți dăm banii înapoi, pe costul nostru, la orice produs, inclusiv la cele gravate.',
          },
        ],
      },
      {
        id: 'right-of-withdrawal',
        title: 'Retragerea în 14 zile',
        blocks: [
          {
            kind: 'p',
            text: 'Dacă ești consumator, te poți retrage din contractul pentru un produs standard în 14 zile, fără să ne spui motivul și fără alte costuri decât transportul de retur.',
          },
          {
            kind: 'p',
            text: 'Cele 14 zile curg de la ziua în care tu, sau cineva indicat de tine (altcineva decât curierul), primești produsul. Dacă ai comandat mai multe produse livrate separat, termenul curge de la primirea ultimului. Dacă ultima zi e o zi nelucrătoare, termenul se încheie la sfârșitul următoarei zile lucrătoare.',
          },
          {
            kind: 'p',
            text: 'Ajunge să ne trimiți decizia înainte să expire termenul. Te poți retrage și înainte să primești coletul: ne anunți și anulăm comanda, fără costuri.',
          },
        ],
      },
      {
        id: 'exceptions',
        title: 'Excepția: produse gravate și lucrări la comandă',
        blocks: [
          {
            kind: 'p',
            text: 'Dreptul de retragere nu se aplică produselor făcute după indicațiile tale sau personalizate clar pentru tine (OUG nr. 34/2014, art. 16 lit. c). La noi, asta înseamnă:',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              'produsele din catalog pe care le gravăm cu textul ales de tine;',
              'lucrările la comandă, stabilite cu tine pe WhatsApp după formularul [La comandă](route:laComanda).',
            ],
          },
          {
            kind: 'p',
            text: 'De ce: o piesă gravată poartă un nume, o dată sau un mesaj ales de tine, iar o lucrare la comandă are forma și dimensiunile cerute de tine. Nu o mai putem vinde altcuiva, așa că nu o putem primi înapoi doar pentru că te-ai răzgândit.',
          },
          {
            kind: 'p',
            text: 'O comandă cu gravură o poți anula fără costuri până începem gravura. Scrie-ne sau sună-ne cât mai repede după ce ai comandat.',
          },
          {
            kind: 'p',
            text: 'Excepția privește doar retragerea. Dacă o piesă gravată sau o lucrare la comandă ajunge deteriorată, defectă sau nu e ce am stabilit, o rezolvăm pe costul nostru ([secțiunea 8](#defective)).',
          },
        ],
      },
      {
        id: 'procedure',
        title: 'Pașii returului',
        blocks: [
          {
            kind: 'list',
            ordered: true,
            items: [
              'Ne scrii la {email}, în cele 14 zile, că te retragi. Poți folosi [formularul de retragere](#withdrawal-form) de la sfârșitul paginii sau orice declarație clară. Scrie numărul comenzii, produsele pe care le returnezi și IBAN-ul în care vrei să primești banii.',
              'Îți confirmăm cererea și îți trimitem pe email adresa la care trimiți coletul.',
              'Trimiți produsul în cel mult 14 zile de la ziua în care ne-ai anunțat, cu firma de curierat pe care o alegi.',
              'Când primim produsul, îl verificăm și îți trimitem banii ([secțiunea 7](#refund)).',
            ],
          },
        ],
      },
      {
        id: 'product-condition',
        title: 'Starea produsului',
        blocks: [
          {
            kind: 'p',
            text: 'Poți desface coletul și verifica produsul cum ai face-o într-un magazin. Dacă îl folosești mai mult de atât, de exemplu tai pe el sau îl speli, răspunzi pentru scăderea valorii lui, iar suma corespunzătoare o putem reține din rambursare.',
          },
          {
            kind: 'p',
            text: 'Ambalează produsul bine, ca să nu se deterioreze pe drum; ideal, în ambalajul în care l-ai primit.',
          },
        ],
      },
      {
        id: 'return-cost',
        title: 'Costul returului',
        blocks: [
          {
            kind: 'p',
            text: 'Când te retragi, costul transportului de retur e al tău.',
          },
          {
            kind: 'p',
            text: 'Când produsul e deteriorat, defect sau greșit, toate costurile, inclusiv transportul, sunt ale noastre ([secțiunea 8](#defective)).',
          },
        ],
      },
      {
        id: 'refund',
        title: 'Rambursarea banilor',
        blocks: [
          {
            kind: 'p',
            text: 'Îți rambursăm prețul produselor returnate și costul livrării, dacă returnezi toate produsele din comandă.',
          },
          {
            kind: 'callout',
            title: 'Prin transfer bancar, în IBAN-ul tău',
            text: 'Comenzile se plătesc ramburs, în numerar, așa că îți trimitem banii prin transfer bancar, în IBAN-ul pe care îl scrii în cererea de retragere. Scriind IBAN-ul, ești de acord să primești banii astfel. Transferul nu te costă nimic.',
          },
          {
            kind: 'p',
            text: 'Îți trimitem banii în cel mult 14 zile de la ziua în care ne-ai anunțat retragerea. Putem amâna rambursarea până primim produsul înapoi sau până ne trimiți dovada că l-ai expediat, oricare dintre aceste momente survine primul.',
          },
          {
            kind: 'p',
            text: 'Dacă ai refuzat coletul la livrare, nu ai plătit nimic, deci nu e nimic de rambursat: anulăm comanda, fără alte costuri pentru tine.',
          },
        ],
      },
      {
        id: 'defective',
        title: 'Produse deteriorate, defecte sau greșite',
        blocks: [
          {
            kind: 'p',
            text: 'Se poate întâmpla ca un colet să sufere pe drum sau să ajungă la tine altceva decât ai comandat. Iată ce faci:',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Când primești coletul, verifică produsul. Dacă e deteriorat, defect sau nu e ce ai comandat, fă câteva poze clare: produsul, problema și ambalajul.',
              'Scrie-ne la {email}, cu numărul comenzii și pozele, sau sună-ne la {phone}.',
              'Stabilim împreună soluția: refacem piesa, o înlocuim sau îți dăm banii înapoi.',
            ],
          },
          {
            kind: 'p',
            text: 'Toate costurile, inclusiv transportul, sunt ale noastre. Regula se aplică tuturor produselor, inclusiv celor gravate și lucrărilor la comandă: e garanția legală de conformitate, care durează 2 ani de la livrare.',
          },
          {
            kind: 'p',
            text: 'Te rugăm să ne anunți cât mai repede după ce observi problema; la deteriorările din transport, ideal chiar în ziua în care primești coletul. Variațiile naturale ale lemnului (fibră, nuanță, noduri) nu sunt defecte.',
          },
        ],
      },
      {
        id: 'disputes',
        title: 'Dacă nu ajungem la o înțelegere',
        blocks: [
          {
            kind: 'p',
            text: 'Scrie-ne întâi; aproape orice problemă se rezolvă direct. Dacă nu ajungem la o înțelegere, poți depune o reclamație la Autoritatea Națională pentru Protecția Consumatorilor ([ANPC](https://anpc.ro)) sau poți apela la [soluționarea alternativă a litigiilor (SAL)](https://anpc.ro/ce-este-sal/).',
          },
        ],
      },
      {
        id: 'withdrawal-form',
        title: 'Anexă: formularul de retragere',
        blocks: [
          {
            kind: 'p',
            text: 'Completează și trimite formularul doar dacă vrei să te retragi din contract. Îl poți copia într-un email către {email}.',
          },
          {
            kind: 'form',
            title: 'Formular de retragere',
            fields: [
              { label: 'Către: {companyName}, {hqAddress}, {email}', blank: false },
              {
                label: 'Vă informez prin prezenta cu privire la retragerea mea din contractul referitor la vânzarea următoarelor produse:',
                blank: true,
              },
              { label: 'Numărul comenzii:', blank: true },
              { label: 'Comandat la data / primit la data:', blank: true },
              { label: 'Numele consumatorului:', blank: true },
              { label: 'Adresa consumatorului:', blank: true },
              {
                label: 'IBAN-ul și titularul contului în care doresc rambursarea (prin care sunt de acord cu rambursarea prin transfer bancar):',
                blank: true,
              },
              { label: 'Semnătura consumatorului (doar dacă formularul este trimis pe hârtie):', blank: true },
              { label: 'Data:', blank: true },
            ],
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
        contact: 'Contact retur',
      },
      placeholderBanner: 'Datele firmei vor fi actualizate înainte de lansare.',
    },
  },
  en: {
    meta: {
      title: 'Returns Policy — Oak Fantasy',
      description:
        'How to return an Oak Fantasy product: the 14-day right of withdrawal, the exception for engraved products and custom work, damaged products, refunds and the withdrawal form.',
    },
    hero: {
      eyebrow: 'Returns policy',
      title: 'Returns policy',
      lastUpdated: LEGAL_LAST_UPDATED.en,
      lastUpdatedLabel: 'Last updated',
    },
    intro:
      'This page explains what to do if you change your mind or if a product does not arrive as it should. For any return, the first step is the same: write to us at {email}. The Romanian version is the reference version.',
    tocLabel: 'Contents',
    sections: [
      {
        id: 'summary',
        title: 'In short',
        blocks: [
          {
            kind: 'callout',
            title: 'Standard products: 14 days, no reason needed',
            text: 'You can withdraw within 14 days of receiving the product, without telling us why. You pay for the return shipping.',
          },
          {
            kind: 'callout',
            title: 'Engraved products and custom work: no returns',
            text: 'They are made for you, so we cannot take them back just because you changed your mind.',
          },
          {
            kind: 'callout',
            title: 'Damaged, faulty or wrong products: we put it right',
            text: 'We remake, replace or refund, at our cost, for every product, engraved ones included.',
          },
        ],
      },
      {
        id: 'right-of-withdrawal',
        title: 'Withdrawal within 14 days',
        blocks: [
          {
            kind: 'p',
            text: 'If you are a consumer, you can withdraw from the contract for a standard product within 14 days, without giving a reason and without any cost other than the return shipping.',
          },
          {
            kind: 'p',
            text: 'The 14 days run from the day you, or someone you name (other than the courier), receive the product. If you ordered several products delivered separately, the period runs from receipt of the last one. If the last day is not a working day, the period ends at the end of the next working day.',
          },
          {
            kind: 'p',
            text: 'It is enough to send us your decision before the period ends. You can also withdraw before the parcel arrives: tell us and we cancel the order, at no cost.',
          },
        ],
      },
      {
        id: 'exceptions',
        title: 'The exception: engraved products and custom work',
        blocks: [
          {
            kind: 'p',
            text: 'The right of withdrawal does not apply to goods made to your specifications or clearly personalised for you (Romanian Government Emergency Ordinance no. 34/2014, art. 16(c)). For us this means:',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              'catalogue products we engrave with the text you choose;',
              'custom work, agreed with you on WhatsApp after the [custom orders](route:laComanda) form.',
            ],
          },
          {
            kind: 'p',
            text: 'Why: an engraved piece carries a name, a date or a message you chose, and custom work has the shape and size you asked for. We cannot sell it to anyone else, so we cannot take it back just because you changed your mind.',
          },
          {
            kind: 'p',
            text: 'An order with engraving can be cancelled at no cost until we start engraving. Write to us or call us as soon as possible after ordering.',
          },
          {
            kind: 'p',
            text: 'The exception only concerns withdrawal. If an engraved piece or custom work arrives damaged, faulty or not as agreed, we put it right at our cost ([section 8](#defective)).',
          },
        ],
      },
      {
        id: 'procedure',
        title: 'How to return a product',
        blocks: [
          {
            kind: 'list',
            ordered: true,
            items: [
              'Write to us at {email}, within the 14 days, saying you are withdrawing. You can use the [withdrawal form](#withdrawal-form) at the end of this page or any clear statement. Include the order number, the products you are returning and the IBAN where you want to receive the money.',
              'We confirm your request and email you the address to send the parcel to.',
              'You send the product within 14 days of the day you told us, with the courier company of your choice.',
              'When we receive the product, we check it and send you the money ([section 7](#refund)).',
            ],
          },
        ],
      },
      {
        id: 'product-condition',
        title: 'Condition of the product',
        blocks: [
          {
            kind: 'p',
            text: 'You can open the parcel and examine the product as you would in a shop. If you use it beyond that, for example by cutting on it or washing it, you are liable for the loss in its value, and we may deduct the corresponding amount from the refund.',
          },
          {
            kind: 'p',
            text: 'Pack the product well so it is not damaged on the way; ideally in the packaging it came in.',
          },
        ],
      },
      {
        id: 'return-cost',
        title: 'Return costs',
        blocks: [
          {
            kind: 'p',
            text: 'When you withdraw, you pay for the return shipping.',
          },
          {
            kind: 'p',
            text: 'When the product is damaged, faulty or wrong, all costs, shipping included, are ours ([section 8](#defective)).',
          },
        ],
      },
      {
        id: 'refund',
        title: 'Refunds',
        blocks: [
          {
            kind: 'p',
            text: 'We refund the price of the returned products and the delivery cost, if you return every product in the order.',
          },
          {
            kind: 'callout',
            title: 'By bank transfer, to your IBAN',
            text: 'Orders are paid cash on delivery, so we refund you by bank transfer to the IBAN you give in your withdrawal request. By giving your IBAN, you agree to be refunded this way. The transfer costs you nothing.',
          },
          {
            kind: 'p',
            text: 'We send the money within 14 days of the day you told us you are withdrawing. We may hold the refund until we receive the product back or until you send us proof that you have shipped it, whichever comes first.',
          },
          {
            kind: 'p',
            text: 'If you refused the parcel on delivery, you have paid nothing, so there is nothing to refund: we cancel the order, at no further cost to you.',
          },
        ],
      },
      {
        id: 'defective',
        title: 'Damaged, faulty or wrong products',
        blocks: [
          {
            kind: 'p',
            text: 'A parcel can get damaged on the way, or something other than what you ordered can arrive. Here is what to do:',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'When the parcel arrives, check the product. If it is damaged, faulty or not what you ordered, take a few clear photos: the product, the problem and the packaging.',
              'Write to us at {email}, with the order number and the photos, or call {phone}.',
              'We agree the solution together: we remake the piece, replace it or refund you.',
            ],
          },
          {
            kind: 'p',
            text: 'All costs, shipping included, are ours. This applies to every product, including engraved products and custom work: it is the legal guarantee of conformity, which lasts 2 years from delivery.',
          },
          {
            kind: 'p',
            text: 'Please tell us as soon as you notice the problem; for damage in transit, ideally on the day the parcel arrives. Natural variations in the wood (grain, shade, knots) are not defects.',
          },
        ],
      },
      {
        id: 'disputes',
        title: 'If we cannot agree',
        blocks: [
          {
            kind: 'p',
            text: 'Please write to us first; almost every problem is solved directly. If we cannot agree, you can file a complaint with the Romanian National Authority for Consumer Protection ([ANPC](https://anpc.ro)) or use [alternative dispute resolution (SAL)](https://anpc.ro/ce-este-sal/).',
          },
        ],
      },
      {
        id: 'withdrawal-form',
        title: 'Annex: withdrawal form',
        blocks: [
          {
            kind: 'p',
            text: 'Complete and send this form only if you wish to withdraw from the contract. You can copy it into an email to {email}.',
          },
          {
            kind: 'form',
            title: 'Withdrawal form',
            fields: [
              { label: 'To: {companyName}, {hqAddress}, {email}', blank: false },
              {
                label: 'I hereby give notice that I withdraw from my contract of sale of the following goods:',
                blank: true,
              },
              { label: 'Order number:', blank: true },
              { label: 'Ordered on / received on:', blank: true },
              { label: 'Name of consumer:', blank: true },
              { label: 'Address of consumer:', blank: true },
              {
                label: 'IBAN and account holder for the refund (by which I agree to be refunded by bank transfer):',
                blank: true,
              },
              { label: 'Signature of consumer (only if this form is sent on paper):', blank: true },
              { label: 'Date:', blank: true },
            ],
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
        contact: 'Returns contact',
      },
      placeholderBanner: 'Company details will be updated before launch.',
    },
  },
};
