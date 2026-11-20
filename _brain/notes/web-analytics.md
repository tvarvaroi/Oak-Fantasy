# Web Analytics (Vercel) — decizie, confidențialitate, cum se citesc cifrele

> Instalat 2026-11-20. Documentație verificată în aceeași zi pe vercel.com/docs/analytics
> (quickstart, package, custom-events, redacting-sensitive-data, limits-and-pricing,
> privacy-policy, troubleshooting) + sursa pachetului `@vercel/analytics` 2.0.1 și scriptul
> servit pe oakfantasy.ro. Context7 nu era autentificat în sesiune.

## Decizie

Vercel Web Analytics, plan Hobby, doar afișări de pagină. Fără cookie-uri, fără banner de
consimțământ, fără evenimente proprii deocamdată. Motiv: vrem să știm câți oameni ajung pe
site și pe ce pagini, fără să identificăm pe nimeni și fără un al doilea furnizor
(Vercel găzduiește deja site-ul).

## Unde e codul

- `components/analytics/WebAnalytics.tsx` — wrapper `'use client'` peste `<Analytics />` din
  `@vercel/analytics/next` (funcția `beforeSend` nu poate fi trimisă dintr-un layout server).
  Randat doar în build-ul de producție: în `next dev` pachetul ar încărca un script de debug
  de pe `va.vercel-scripts.com`, gazdă pe care CSP-ul nu o permite.
- Montat în `app/[locale]/layout.tsx`, în `<body>`, lângă `<SpeedInsights />` (aceeași regulă:
  randează un `<Suspense>`, nu are voie în afara `<html>` — vezi gotchas 2026-06-23).
  `/admin` și `/auth` au layout-uri proprii, deci componenta nici nu se montează acolo.
- `lib/analytics/redact-url.ts` — filtrul de confidențialitate (funcție pură).
- `tests/e2e/analytics-redact.spec.ts` — testele filtrului.
- `scripts/smoke-analytics.mjs` — smoke pe `next start`: servește o copie a scriptului real,
  prinde cererile și verifică ce URL pleacă. Scriptul Vercel ignoră browserele automate
  (`navigator.webdriver`, „Headless” în user agent), de aceea smoke-ul își pune un user agent
  obișnuit.

## CSP

Nicio schimbare. În producție scriptul vine de la `/_vercel/insights/script.js`, iar cererile
merg la `/_vercel/insights/view` (și `/event`), toate pe aceeași origine → acoperite de
`script-src 'self'` și `connect-src 'self'`. Documentația descrie și o variantă cu o cale
generată la build (`/<unique-path>/…`); și aceea e pe aceeași origine. Dacă Vercel mută
vreodată scriptul pe altă gazdă, apare o încălcare CSP în consolă și vizitele se opresc.

## Ce pleacă de pe site

Cererea conține: URL-ul (după filtru), ruta ca șablon (`/[locale]/multumim/[orderId]`, fără
valori), referrer-ul doar când vine de pe alt site, versiunea scriptului. Fără cookie-uri,
fără localStorage (cheia `__va_attribution` se scrie doar la `identify`, pe care nu-l folosim).

Filtrul (`beforeSend`):

| URL real | Ce se raportează |
|---|---|
| `/admin/…`, `/auth/…`, `/api/…` | nimic |
| orice `?query` și `#hash` | eliminate |
| `/ro/multumim/<uuid>` | `/ro/multumim` |
| `/ro/tocatoare/<slug>` | neschimbat (slug public) |
| al doilea segment care arată a identificator (uuid, OF-2026-…, email, cifre, hex lung) | `/ro/<pagină>/[id]` |
| pagină necunoscută, 404, cale mai adâncă | `/ro/[other]` sau `/[other]` |

E o listă de permisiuni: paginile cunoscute vin din `PATHNAMES` (`lib/i18n-routes.ts`).
**O rută publică nouă care nu e în `PATHNAMES` apare în cifre ca `[other]`.**

## Cum se citesc cifrele

Vercel → proiect → Analytics.

- **Visitors** = vizitatori unici pe zi. Vercel îi deosebește printr-un hash al cererii, pe
  care îl aruncă după 24 de ore; același om în două zile = doi vizitatori. Nu se pot urmări
  persoane și nu există „utilizatori care revin”.
- **Page Views** = afișări de pagină, inclusiv navigările interne (fără reîncărcare).
- **Comenzi plasate** ≈ afișările paginilor `/ro/multumim` + `/en/thank-you`. Un client care
  reîncarcă pagina se numără de două ori; cifra exactă rămâne în admin → Comenzi.
- **Cereri la comandă**: deocamdată nu se pot număra (mesajul de succes apare pe aceeași
  pagină). Cifra exactă e în admin → Comenzi custom.
- `[other]` = 404-uri și adrese necunoscute; `[id]` = identificator ascuns.
- Vizitele noastre pe paginile publice se numără; cele din `/admin` nu.
- Boții care se declară (browser automat, „Headless”) nu sunt numărați; testele Playwright nici ele.
- Hobby: 50.000 de evenimente pe lună, istoric de o lună. Peste limită colectarea se oprește
  până la ciclul următor (nu costă nimic). Datele apar în tablou după primele vizite reale.

## Evenimente proprii — pas pentru planul Pro

Neimplementate. Documentația spune că evenimentele proprii sunt disponibile pe Pro și
Enterprise și **nu spune** ce se întâmplă cu apelurile `track()` pe Hobby (dacă sunt ignorate,
dacă dau eroare sau dacă se scad din cele 50.000 de evenimente). Pe Pro: maximum 2 proprietăți
pe eveniment, valori șir/număr/boolean/null, maximum 255 de caractere.

Când trecem pe Pro (`import { track } from '@vercel/analytics'`, în componente client):

| Eveniment | Unde | Proprietăți |
|---|---|---|
| `add_to_cart` | `components/product/AddToCartPanel.tsx`, după adăugarea în coș | `product` (slug), `locale` |
| `order_placed` | `components/checkout/CheckoutContent.tsx`, când `placeOrder` răspunde ok, înainte de redirect | `payment` (ramburs/card), `locale` |
| `custom_request_sent` | `components/la-comanda/CustomOrderForm.tsx`, la `res.ok` | `locale` |

Fără nume, telefon, email, număr de comandă, valoare a comenzii sau text de gravură.
Evenimentele trec și ele prin `beforeSend` (URL-ul paginii e curățat la fel).
