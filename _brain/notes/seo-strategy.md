# SEO Strategy — Oak Fantasy

> Target primar: RO. Site bilingv RO/EN. Etapa 1 = SEO acumulează înainte de tranzacții.

## Cuvinte cheie primare (high intent — buying)

- tocător din lemn de stejar
- tocător de bucătărie lemn
- tocător de lemn românesc
- tocător de lemn handmade
- tocător end grain
- bloc de tăiat lemn
- fund de lemn pentru bucătărie

## Cuvinte cheie informaționale (content)

- cum aleg un tocător de lemn
- stejar vs fag tocător
- cum îngrijesc un tocător de lemn
- ulei pentru tocător de lemn
- diferența end grain edge grain

## Cuvinte cheie pentru cadouri

- cadou bucătărie handmade
- cadou nuntă tocător
- cadou casă nouă
- tocător personalizat gravat

## Structură URL (sub `app/[locale]/`)

| URL | Pagină |
|---|---|
| `/` | landing (redirect → `/ro`) |
| `/despre` | Despre noi |
| `/atelier` | Atelierul nostru (proces) |
| `/tocatoare` | Catalog |
| `/tocatoare/[slug]` | Pagină produs individual |
| `/ingrijire` | Ghid de îngrijire (SEO heavy) |
| `/blog` | Blog index |
| `/blog/[slug]` | Articol |
| `/contact` | Contact |
| `/cadouri` | Ghid de cadouri (high SEO value) |

## Articole SEO prioritare (în ordine)

1. Cum alegi un tocător de lemn — ghid complet
2. Tocător end-grain vs edge-grain — diferența și care e mai bun
3. Cum îngrijești un tocător de lemn ca să-l ai 20 de ani
4. Stejar vs fag pentru tocător — care e cel mai bun
5. Cadouri handmade pentru bucătărie — 10 idei care durează
6. Tocător personalizat gravat — ghid pentru cadouri memorabile
7. De ce un tocător din lemn e mai bun decât unul din plastic
8. Mărimea perfectă pentru tocător — cum alegi

### Recomandări suplimentare (peste cele 8)

9. „Tocător pentru pâine vs tocător pentru carne — ai nevoie de amândouă?" (long-tail, intent practic)
10. „Cât costă un tocător de lemn făcut manual și de ce" (transparență preț → încredere, captează „preț tocător lemn")
11. „Întreținerea lunară a tocătorului: rutina de 5 minute" (retenție + re-vânzare ulei/ceară)
12. „Stejar românesc din Carpați: de unde vine lemnul nostru" (brand story + E-E-A-T, diferențiere)

## Schema markup necesar

- `Organization` pe layout (`app/layout` sau `[locale]/layout`)
- `Product` pe pagini produs (`/tocatoare/[slug]`)
- `Article` pe articole blog
- `BreadcrumbList` pe toate paginile interne
- `FAQPage` pe `/ingrijire` și pe articolele cu FAQ

## Technical SEO checklist

- `robots.txt` cu referință sitemap
- `sitemap.xml` dinamic (Next.js App Router: `app/sitemap.ts`)
- Meta tags per pagină (title, description, `og:image`, `twitter:card`) — extinde pattern-ul din `generateMetadata` existent în `[locale]/layout.tsx`
- Canonical URLs
- `hreflang` pentru RO/EN (alternate links)
- Alt text obligatoriu la toate imaginile (`next/image`)
- Core Web Vitals: LCP <2.5s, FID/INP <100ms, CLS <0.1
- Mobile-first (deja respectat)

## Note de implementare

- i18n curent = custom prin `middleware.ts` → la SEO multilingv, generează `alternates.languages` în `generateMetadata` și `hreflang` corect pentru `/ro` și `/en`.
- Catalogul (10 SKU în CLAUDE.md §8) → `Product` schema cu preț RON, dimensiuni, timp producție.
