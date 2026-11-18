import type { Locale } from '@/lib/i18n-routes';

import { LEGAL_LAST_UPDATED, type LegalContent } from '../content';

// Privacy policy — final text (2026-11-19), written from the code audit of
// that day (what is collected, where it goes, what is kept). RO is the
// reference version. When a data flow changes (new form, analytics, card
// payments back on, newsletter reactivated), this file changes with it.
// Retention periods confirmed by the founder at the gate; deletion is manual
// (no automated job). Stripe is dormant → deliberately not listed.

export const PRIVACY_CONTENT: Record<Locale, LegalContent> = {
  ro: {
    meta: {
      title: 'Politica de confidențialitate — Oak Fantasy',
      description:
        'Ce date personale folosim pe oakfantasy.ro, de ce și cât timp, cui le transmitem, ce cookie-uri folosim și cum îți exerciți drepturile.',
    },
    hero: {
      eyebrow: 'Confidențialitate',
      title: 'Politica de confidențialitate',
      lastUpdated: LEGAL_LAST_UPDATED.ro,
      lastUpdatedLabel: 'Ultima actualizare',
    },
    intro:
      'Aici explicăm ce date personale folosim, de ce, cât timp le păstrăm, cui le transmitem și ce drepturi ai. Pe scurt: folosim datele tale ca să-ți lucrăm și să-ți livrăm comanda și ca să-ți răspundem. Nu le vindem, nu facem reclamă cu ele și nu folosim cookie-uri de urmărire.',
    tocLabel: 'Cuprins',
    sections: [
      {
        id: 'data-controller',
        title: 'Cine prelucrează datele',
        blocks: [
          {
            kind: 'p',
            text: 'Operatorul datelor tale este **{companyName}** (Oak Fantasy), cu sediul social în {hqAddress}, CUI {cui}, nr. Reg. Com. {regCom}.',
          },
          {
            kind: 'p',
            text: 'Pentru orice întrebare despre datele tale ne scrii la {email} sau ne suni la {phone} ({hours}).',
          },
          {
            kind: 'p',
            text: 'Nu avem un responsabil cu protecția datelor (DPO): pentru dimensiunea și natura activității noastre, legea nu ne obligă să numim unul. Cererile despre date le tratăm direct noi, la adresa de mai sus.',
          },
        ],
      },
      {
        id: 'summary',
        title: 'Pe scurt',
        blocks: [
          {
            kind: 'list',
            ordered: false,
            items: [
              'Cerem doar datele de care avem nevoie pentru comandă, livrare și ca să-ți răspundem.',
              'Nu vindem și nu închiriem datele tale nimănui.',
              'Nu folosim cookie-uri de analiză sau de reclamă și nu avem pixeli de urmărire.',
              'Nu îți trimitem mesaje de marketing.',
              'Baza de date a site-ului e găzduită în Uniunea Europeană (Frankfurt, Germania).',
            ],
          },
        ],
      },
      {
        id: 'data-types',
        title: 'Ce date folosim, de ce, pe ce temei și cât timp',
        blocks: [
          {
            kind: 'p',
            text: 'Mai jos e fiecare situație în care primim date personale. Temeiurile sunt cele din Regulamentul general privind protecția datelor (GDPR), art. 6 alin. (1). Ștergerea la sfârșitul perioadei o facem manual.',
          },
          {
            kind: 'record',
            title: 'Când plasezi o comandă (cu sau fără cont)',
            rows: [
              {
                label: 'Ce date',
                text: 'Numele, emailul, telefonul, adresa de livrare, observațiile tale la comandă, textul gravurii (dacă alegi gravură), produsele comandate și limba în care ai folosit site-ul.',
              },
              {
                label: 'De ce',
                text: 'Ca să confirmăm comanda cu tine, s-o lucrăm, s-o livrăm, să-ți trimitem emailul de primire a comenzii și să emitem documentul fiscal.',
              },
              {
                label: 'Temei',
                text: 'Executarea contractului (lit. b) și obligațiile noastre legale fiscale și contabile (lit. c).',
              },
              {
                label: 'Cât timp',
                text: 'Cât ne obligă legea contabilă să păstrăm documentele comenzii.',
              },
            ],
          },
          {
            kind: 'record',
            title: 'Contul de client',
            rows: [
              {
                label: 'Ce date',
                text: 'Numele, emailul, telefonul (opțional) și parola. Parola e păstrată doar ca hash (criptată ireversibil); nici noi nu o putem vedea.',
              },
              {
                label: 'De ce',
                text: 'Ca să intri în cont, să-ți poți reseta parola și să-ți completăm automat datele când comanzi.',
              },
              {
                label: 'Temei',
                text: 'Executarea contractului pentru cont, pe care îl accepți când îți faci cont (lit. b).',
              },
              {
                label: 'Cât timp',
                text: 'Cât timp ai contul. Dacă nu te conectezi 3 ani, îl ștergem. Poți cere oricând ștergerea lui; comenzile rămân pe termenul contabil.',
              },
            ],
          },
          {
            kind: 'record',
            title: 'Formularul de contact',
            rows: [
              {
                label: 'Ce date',
                text: 'Numele, emailul, telefonul (opțional), subiectul și mesajul tău.',
              },
              {
                label: 'De ce',
                text: 'Ca să-ți răspundem. Mesajul ajunge la noi pe email; nu îl salvăm în baza de date a site-ului.',
              },
              {
                label: 'Temei',
                text: 'Interesul nostru legitim de a răspunde celor care ne scriu (lit. f). Dacă ne scrii despre o comandă, executarea contractului (lit. b).',
              },
              {
                label: 'Cât timp',
                text: '2 ani de la ultimul mesaj din conversație.',
              },
            ],
          },
          {
            kind: 'record',
            title: 'Formularul „La comandă” și discuția pe WhatsApp',
            rows: [
              {
                label: 'Ce date',
                text: 'Numele, telefonul, descrierea ideii și limba paginii. Descrierea poate cuprinde date despre alte persoane, de exemplu un nume de gravat; trimite-ne doar ce e necesar pentru lucrare.',
              },
              {
                label: 'De ce',
                text: 'Ca să te contactăm pe WhatsApp, la numărul lăsat, și să stabilim împreună detaliile și prețul lucrării.',
              },
              {
                label: 'Temei',
                text: 'Demersuri făcute la cererea ta înainte de încheierea unui contract (lit. b). Dacă lucrarea devine comandă: executarea contractului și obligațiile contabile (lit. b și c).',
              },
              {
                label: 'Cât timp',
                text: 'Cererile care nu devin comenzi le ștergem la 12 luni de la ultima actualizare. Cele care devin comenzi rămân pe termenul contabil.',
              },
            ],
          },
          {
            kind: 'record',
            title: 'Protecția site-ului împotriva abuzului',
            rows: [
              {
                label: 'Ce date',
                text: 'Adresa IP, când trimiți formularul de contact sau formularul „La comandă”.',
              },
              {
                label: 'De ce',
                text: 'Ca să limităm trimiterile automate (spam). Dacă o trimitere e respinsă ca spam, IP-ul apare și în jurnalele tehnice ale serverului.',
              },
              {
                label: 'Temei',
                text: 'Interesul nostru legitim de a ține site-ul în siguranță (lit. f).',
              },
              {
                label: 'Cât timp',
                text: 'Pentru limitarea trimiterilor o folosim doar într-o fereastră de o oră, în memoria serverului; nu o salvăm în baza de date. Jurnalele tehnice se păstrează pe perioada scurtă stabilită de furnizorul de găzduire.',
              },
            ],
          },
          {
            kind: 'record',
            title: 'Măsurarea vitezei site-ului',
            rows: [
              {
                label: 'Ce date',
                text: 'Date tehnice despre încărcarea paginilor (de exemplu, pagina, tipul de dispozitiv și de browser, timpii de încărcare), colectate prin Vercel Speed Insights, fără cookie-uri.',
              },
              {
                label: 'De ce',
                text: 'Ca să vedem dacă site-ul se încarcă repede și să-l îmbunătățim. Ne uităm doar la cifre agregate; nu le legăm de tine.',
              },
              {
                label: 'Temei',
                text: 'Interesul nostru legitim de a avea un site care funcționează bine (lit. f).',
              },
              {
                label: 'Cât timp',
                text: 'Cât le păstrează furnizorul, în formă agregată.',
              },
            ],
          },
          {
            kind: 'p',
            text: 'Newsletter: în acest moment nu colectăm adrese de email pentru newsletter. Dacă îl vom reporni, actualizăm întâi această politică.',
          },
        ],
      },
      {
        id: 'recipients',
        title: 'Cui transmitem datele',
        blocks: [
          {
            kind: 'p',
            text: 'Datele ajung doar la furnizorii care ne ajută să ținem site-ul și comenzile în funcțiune, și doar cât le trebuie pentru asta. Furnizorii care prelucrează date pentru noi o fac pe baza unor contracte care îi obligă să le protejeze.',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              '**Supabase** – baza de date și conturile de client, inclusiv emailurile de resetare a parolei. Serverele bazei de date sunt în Uniunea Europeană (Frankfurt).',
              '**Vercel** – găzduirea site-ului și măsurarea vitezei lui.',
              '**Resend** – trimiterea emailurilor automate: emailul de primire a comenzii, răspunsul automat la mesajele trimise prin formularul de contact și notificările către noi despre comenzi, mesaje și cereri.',
              '**Google (Gmail)** – căsuța de email în care primim mesajele și notificările.',
              '**WhatsApp (Meta)** – canalul prin care discutăm lucrările la comandă și prin care putem confirma comenzile.',
              '**Firma de curierat care livrează comanda** – numele, telefonul și adresa de livrare.',
              '**Prestatorul de servicii de contabilitate** – documentele fiscale ale comenzilor.',
              '**Autorități publice** – doar când legea ne obligă.',
            ],
          },
        ],
      },
      {
        id: 'international-transfer',
        title: 'Transferuri în afara Spațiului Economic European',
        blocks: [
          {
            kind: 'p',
            text: 'Unii dintre furnizori (Vercel, Resend, Google, Meta) sunt companii din SUA sau fac parte din grupuri din SUA, așa că datele pot ajunge și în afara Spațiului Economic European. În aceste cazuri, transferul se face cu garanțiile cerute de GDPR: decizia de adecvare a Comisiei Europene pentru companiile certificate în cadrul UE–SUA privind protecția datelor (Data Privacy Framework) sau clauzele contractuale standard aprobate de Comisia Europeană.',
          },
        ],
      },
      {
        id: 'cookies',
        title: 'Cookie-uri și stocare locală',
        blocks: [
          {
            kind: 'p',
            text: 'Folosim doar ce e strict necesar ca site-ul să funcționeze:',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              '**Cookie-ul de sesiune** (numele începe cu „sb-” și conține „auth-token”), doar dacă intri în cont. Te ține conectat și se șterge când ieși din cont.',
              '**Coșul de cumpărături**, păstrat în memoria browserului tău (localStorage, sub cheia „oak-cart”), inclusiv textul gravurii, dacă ai ales una. Nu ajunge la noi până nu plasezi comanda și se golește după ce comanda e trimisă.',
            ],
          },
          {
            kind: 'p',
            text: 'Nu folosim cookie-uri de analiză, de reclamă sau de la terți. Măsurarea vitezei site-ului nu folosește cookie-uri. De aceea nu îți cerem acordul printr-un banner de cookie-uri.',
          },
          {
            kind: 'p',
            text: 'Poți șterge oricând cookie-urile și datele site-ului din setările browserului. Dacă faci asta, vei fi deconectat din cont, iar coșul se golește.',
          },
        ],
      },
      {
        id: 'security',
        title: 'Securitate',
        blocks: [
          {
            kind: 'list',
            ordered: false,
            items: [
              'Conexiunea cu site-ul e criptată (HTTPS).',
              'Parolele sunt păstrate doar ca hash (criptate ireversibil).',
              'La comenzi, conturi și cereri are acces doar administratorul magazinului, cu cont protejat; reguli stabilite în baza de date împiedică orice altă persoană să le citească.',
              'Formularele publice sunt protejate împotriva trimiterilor automate.',
            ],
          },
          {
            kind: 'p',
            text: 'Dacă apare o încălcare a securității datelor care îți poate pune în pericol drepturile, te anunțăm și anunțăm autoritatea, cum cere legea.',
          },
        ],
      },
      {
        id: 'data-subject-rights',
        title: 'Drepturile tale',
        blocks: [
          {
            kind: 'p',
            text: 'În legătură cu datele tale personale, ai dreptul:',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              'să afli ce date avem despre tine și să primești o copie (dreptul de acces);',
              'să ne ceri să corectăm datele greșite sau incomplete (rectificare);',
              'să ne ceri să ștergem datele, când nu mai avem un motiv legal să le păstrăm (ștergere);',
              'să ne ceri să le folosim doar limitat, de exemplu cât verificăm o contestație (restricționare);',
              'să primești datele pe care ni le-ai dat într-un format ușor de folosit sau să ne ceri să le trimitem altcuiva (portabilitate);',
              'să te opui prelucrărilor bazate pe interesul nostru legitim (opoziție).',
            ],
          },
          {
            kind: 'p',
            text: 'Nu luăm decizii automate despre tine și nu îți creăm un profil.',
          },
        ],
      },
      {
        id: 'gdpr-contact',
        title: 'Cum îți exerciți drepturile',
        blocks: [
          {
            kind: 'p',
            text: 'Scrie-ne la {email}, de preferat de pe adresa folosită la comandă sau în cont, ca să te putem identifica. Dacă nu putem fi siguri că cererea vine de la tine, îți putem cere o confirmare suplimentară.',
          },
          {
            kind: 'p',
            text: 'Răspundem în cel mult o lună. Dacă cererea e complexă, termenul se poate prelungi cu încă două luni; te anunțăm în prima lună. Exercitarea drepturilor e gratuită.',
          },
          {
            kind: 'p',
            text: 'Ștergerea contului o facem la cerere. Comenzile rămân pe termenul contabil, pentru că legea ne obligă să le păstrăm.',
          },
        ],
      },
      {
        id: 'complaint-right',
        title: 'Plângere la ANSPDCP',
        blocks: [
          {
            kind: 'p',
            text: 'Dacă crezi că îți folosim datele greșit, ne-ar plăcea să ne scrii întâi nouă. Ai oricând dreptul să depui o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP): [www.dataprotection.ro](https://www.dataprotection.ro).',
          },
        ],
      },
      {
        id: 'minors',
        title: 'Minori',
        blocks: [
          {
            kind: 'p',
            text: 'Site-ul, conturile și comenzile sunt pentru persoane de cel puțin 18 ani. Nu colectăm cu bună știință date despre minori. Dacă afli că un minor ne-a trimis date, scrie-ne și le ștergem.',
          },
        ],
      },
      {
        id: 'changes',
        title: 'Modificări',
        blocks: [
          {
            kind: 'p',
            text: 'Când schimbăm felul în care folosim datele, actualizăm această pagină și data de sus.',
          },
        ],
      },
    ],
    companyInfo: {
      sectionLabel: 'Operatorul datelor',
      labels: {
        operator: 'Operator',
        cui: 'CUI',
        regCom: 'Reg. Com.',
        sediu: 'Sediu social',
        contact: 'Contact date personale',
      },
      placeholderBanner: 'Datele firmei vor fi actualizate înainte de lansare.',
    },
  },
  en: {
    meta: {
      title: 'Privacy Policy — Oak Fantasy',
      description:
        'What personal data we use on oakfantasy.ro, why and for how long, who we share it with, which cookies we use and how to exercise your rights.',
    },
    hero: {
      eyebrow: 'Privacy',
      title: 'Privacy policy',
      lastUpdated: LEGAL_LAST_UPDATED.en,
      lastUpdatedLabel: 'Last updated',
    },
    intro:
      'This page explains what personal data we use, why, how long we keep it, who we share it with and what rights you have. In short: we use your data to make and deliver your order and to answer you. We do not sell it, we do not advertise with it and we do not use tracking cookies. The Romanian version is the reference version.',
    tocLabel: 'Contents',
    sections: [
      {
        id: 'data-controller',
        title: 'Who processes your data',
        blocks: [
          {
            kind: 'p',
            text: 'The controller of your data is **{companyName}** (Oak Fantasy), registered office {hqAddress}, tax ID (CUI) {cui}, Trade Register no. {regCom}.',
          },
          {
            kind: 'p',
            text: 'For any question about your data, write to us at {email} or call {phone} ({hours}).',
          },
          {
            kind: 'p',
            text: 'We do not have a data protection officer (DPO): given the size and nature of our business, the law does not require us to appoint one. We handle data requests ourselves, at the address above.',
          },
        ],
      },
      {
        id: 'summary',
        title: 'In short',
        blocks: [
          {
            kind: 'list',
            ordered: false,
            items: [
              'We only ask for the data we need for your order, its delivery and to answer you.',
              'We do not sell or rent your data to anyone.',
              'We do not use analytics or advertising cookies and we have no tracking pixels.',
              'We do not send you marketing messages.',
              'The site’s database is hosted in the European Union (Frankfurt, Germany).',
            ],
          },
        ],
      },
      {
        id: 'data-types',
        title: 'What data we use, why, on what basis and for how long',
        blocks: [
          {
            kind: 'p',
            text: 'Below is every situation in which we receive personal data. The legal bases are those in the General Data Protection Regulation (GDPR), art. 6(1). We delete data manually at the end of each period.',
          },
          {
            kind: 'record',
            title: 'When you place an order (with or without an account)',
            rows: [
              {
                label: 'What',
                text: 'Your name, email, phone, delivery address, your order notes, the engraving text (if you choose one), the products ordered and the language you used on the site.',
              },
              {
                label: 'Why',
                text: 'To confirm the order with you, make it, deliver it, send you the order receipt email and issue the tax document.',
              },
              {
                label: 'Legal basis',
                text: 'Performance of the contract (point b) and our legal tax and accounting obligations (point c).',
              },
              {
                label: 'How long',
                text: 'As long as accounting law requires us to keep the order documents.',
              },
            ],
          },
          {
            kind: 'record',
            title: 'Customer account',
            rows: [
              {
                label: 'What',
                text: 'Your name, email, phone (optional) and password. The password is stored only as a hash (irreversibly encrypted); we cannot see it either.',
              },
              {
                label: 'Why',
                text: 'So you can sign in, reset your password and have your details filled in when you order.',
              },
              {
                label: 'Legal basis',
                text: 'Performance of the account contract you accept when you create an account (point b).',
              },
              {
                label: 'How long',
                text: 'For as long as you keep the account. If you do not sign in for 3 years, we delete it. You can ask us to delete it at any time; orders stay for the accounting period.',
              },
            ],
          },
          {
            kind: 'record',
            title: 'Contact form',
            rows: [
              {
                label: 'What',
                text: 'Your name, email, phone (optional), the subject and your message.',
              },
              {
                label: 'Why',
                text: 'To answer you. Your message reaches us by email; we do not store it in the site’s database.',
              },
              {
                label: 'Legal basis',
                text: 'Our legitimate interest in answering people who write to us (point f). If you write about an order, performance of the contract (point b).',
              },
              {
                label: 'How long',
                text: '2 years from the last message in the conversation.',
              },
            ],
          },
          {
            kind: 'record',
            title: 'The custom orders form and the WhatsApp conversation',
            rows: [
              {
                label: 'What',
                text: 'Your name, phone, the description of your idea and the page language. The description may include data about other people, such as a name to engrave; please send only what the piece needs.',
              },
              {
                label: 'Why',
                text: 'To contact you on WhatsApp, at the number you left, and agree the details and price of the piece together.',
              },
              {
                label: 'Legal basis',
                text: 'Steps taken at your request before entering into a contract (point b). If the request becomes an order: performance of the contract and accounting obligations (points b and c).',
              },
              {
                label: 'How long',
                text: 'Requests that do not become orders are deleted 12 months after their last update. Those that become orders stay for the accounting period.',
              },
            ],
          },
          {
            kind: 'record',
            title: 'Protecting the site against abuse',
            rows: [
              {
                label: 'What',
                text: 'Your IP address, when you send the contact form or the custom orders form.',
              },
              {
                label: 'Why',
                text: 'To limit automated submissions (spam). If a submission is rejected as spam, the IP also appears in the server’s technical logs.',
              },
              {
                label: 'Legal basis',
                text: 'Our legitimate interest in keeping the site secure (point f).',
              },
              {
                label: 'How long',
                text: 'For rate limiting we only use it within a one-hour window, in server memory; we do not store it in the database. Technical logs are kept for the short period set by the hosting provider.',
              },
            ],
          },
          {
            kind: 'record',
            title: 'Measuring site speed',
            rows: [
              {
                label: 'What',
                text: 'Technical data about how pages load (for example the page, the type of device and browser, loading times), collected through Vercel Speed Insights, without cookies.',
              },
              {
                label: 'Why',
                text: 'To see whether the site loads quickly and improve it. We only look at aggregate figures; we do not link them to you.',
              },
              {
                label: 'Legal basis',
                text: 'Our legitimate interest in a site that works well (point f).',
              },
              {
                label: 'How long',
                text: 'As long as the provider keeps them, in aggregate form.',
              },
            ],
          },
          {
            kind: 'p',
            text: 'Newsletter: we do not currently collect email addresses for a newsletter. If we restart it, we will update this policy first.',
          },
        ],
      },
      {
        id: 'recipients',
        title: 'Who we share data with',
        blocks: [
          {
            kind: 'p',
            text: 'Your data only reaches the providers that help us run the site and the orders, and only as far as they need it. Providers that process data for us do so under contracts that require them to protect it.',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              '**Supabase** – the database and customer accounts, including password reset emails. The database servers are in the European Union (Frankfurt).',
              '**Vercel** – hosting the site and measuring its speed.',
              '**Resend** – sending automatic emails: the order receipt email, the automatic reply to messages sent through the contact form and the notifications to us about orders, messages and requests.',
              '**Google (Gmail)** – the mailbox in which we receive messages and notifications.',
              '**WhatsApp (Meta)** – the channel through which we discuss custom work and may confirm orders.',
              '**The courier company delivering your order** – your name, phone and delivery address.',
              '**Our accounting service provider** – the tax documents for orders.',
              '**Public authorities** – only when the law requires it.',
            ],
          },
        ],
      },
      {
        id: 'international-transfer',
        title: 'Transfers outside the European Economic Area',
        blocks: [
          {
            kind: 'p',
            text: 'Some of our providers (Vercel, Resend, Google, Meta) are US companies or belong to US groups, so data may also leave the European Economic Area. In these cases the transfer relies on the safeguards required by the GDPR: the European Commission’s adequacy decision for companies certified under the EU–US Data Privacy Framework, or the standard contractual clauses approved by the European Commission.',
          },
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies and local storage',
        blocks: [
          {
            kind: 'p',
            text: 'We only use what is strictly necessary for the site to work:',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              '**The session cookie** (its name starts with “sb-” and contains “auth-token”), only if you sign in. It keeps you signed in and is removed when you sign out.',
              '**The shopping cart**, kept in your browser’s storage (localStorage, under the key “oak-cart”), including the engraving text if you chose one. It does not reach us until you place the order and is emptied once the order is sent.',
            ],
          },
          {
            kind: 'p',
            text: 'We do not use analytics, advertising or third-party cookies. Measuring site speed uses no cookies. That is why we do not ask for your consent through a cookie banner.',
          },
          {
            kind: 'p',
            text: 'You can delete the site’s cookies and data at any time in your browser settings. If you do, you will be signed out and the cart will be emptied.',
          },
        ],
      },
      {
        id: 'security',
        title: 'Security',
        blocks: [
          {
            kind: 'list',
            ordered: false,
            items: [
              'The connection to the site is encrypted (HTTPS).',
              'Passwords are stored only as a hash (irreversibly encrypted).',
              'Only the shop administrator, with a protected account, can access orders, accounts and requests; rules set in the database prevent anyone else from reading them.',
              'Public forms are protected against automated submissions.',
            ],
          },
          {
            kind: 'p',
            text: 'If a data breach occurs that may put your rights at risk, we will inform you and the authority, as the law requires.',
          },
        ],
      },
      {
        id: 'data-subject-rights',
        title: 'Your rights',
        blocks: [
          {
            kind: 'p',
            text: 'Regarding your personal data, you have the right:',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              'to know what data we hold about you and get a copy (right of access);',
              'to have wrong or incomplete data corrected (rectification);',
              'to have your data deleted when we no longer have a legal reason to keep it (erasure);',
              'to have its use limited, for example while we check a dispute (restriction);',
              'to receive the data you gave us in an easy-to-use format, or have us send it to someone else (portability);',
              'to object to processing based on our legitimate interest (objection).',
            ],
          },
          {
            kind: 'p',
            text: 'We do not make automated decisions about you and we do not profile you.',
          },
        ],
      },
      {
        id: 'gdpr-contact',
        title: 'How to exercise your rights',
        blocks: [
          {
            kind: 'p',
            text: 'Write to us at {email}, preferably from the address used for your order or account, so we can identify you. If we cannot be sure the request comes from you, we may ask for further confirmation.',
          },
          {
            kind: 'p',
            text: 'We answer within one month. If the request is complex, this can be extended by two more months; we tell you within the first month. Exercising your rights is free.',
          },
          {
            kind: 'p',
            text: 'We delete accounts on request. Orders stay for the accounting period, because the law requires us to keep them.',
          },
        ],
      },
      {
        id: 'complaint-right',
        title: 'Complaints to the supervisory authority',
        blocks: [
          {
            kind: 'p',
            text: 'If you think we are using your data wrongly, we would like you to write to us first. You always have the right to lodge a complaint with the Romanian National Supervisory Authority for Personal Data Processing (ANSPDCP): [www.dataprotection.ro](https://www.dataprotection.ro).',
          },
        ],
      },
      {
        id: 'minors',
        title: 'Minors',
        blocks: [
          {
            kind: 'p',
            text: 'The site, accounts and orders are for people aged 18 or over. We do not knowingly collect data about minors. If you learn that a minor has sent us data, write to us and we will delete it.',
          },
        ],
      },
      {
        id: 'changes',
        title: 'Changes',
        blocks: [
          {
            kind: 'p',
            text: 'When we change how we use data, we update this page and the date at the top.',
          },
        ],
      },
    ],
    companyInfo: {
      sectionLabel: 'Data controller',
      labels: {
        operator: 'Controller',
        cui: 'Tax ID',
        regCom: 'Reg. Com.',
        sediu: 'Registered office',
        contact: 'Data protection contact',
      },
      placeholderBanner: 'Company details will be updated before launch.',
    },
  },
};
