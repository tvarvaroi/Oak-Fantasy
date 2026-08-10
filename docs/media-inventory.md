# Media Inventory + Plan de umplere cu stock

> **STATUS 2026-08-10: EXECUTAT (Task 2).** P1/P3/P4/P5/P6 umplute cu stock Pexels
> (local, `/public/stock/`), P2 umplut cu pozele reale de produs din Supabase
> (`/public/products/`), P7 amânat intenționat. Surse + licențe per fișier în
> [stock-credits.md](stock-credits.md). Tabelul de mai jos rămâne ca referință istorică.

> Creat: 2026-08-10 · Task „Inventar media" (Faza 1 din 2 — inventar + plan, ZERO descărcări încă)
> Decizie founder: pozele de PRODUS sunt reale (nu se ating); restul sloturilor se umplu cu
> stock GRATUIT cu licență comercială (Pexels / Unsplash / Pixabay). Fără sesiune foto proprie.

## Legendă categorii

| Tag | Înseamnă |
|-----|----------|
| `[PRODUS]` | Poză reală de produs (Supabase Storage, urcată de founder) — **nu se atinge** |
| `[BRAND]` | Asset de brand existent (logo SVG/jpeg, treeline Vecteezy) — **nu se atinge**, nu e slot de umplut |
| `[DECOR-SVG]` | Ornament SVG desenat în cod (frunze, crenguțe, noise texture) — intenționat, **nu se umple cu foto** |
| `[STOCK-NEUTRU]` | Stock generic OK: textură lemn, așchii, unelte, mâini lucrând lemn — **fără portret de meșter identificabil** |
| `[STOCK-DECOR]` | Stock ambient: bucătărie, masă servită, lifestyle cu tocătoare |
| `[VIDEO]` | Slot video |
| ⚠️ | ATENȚIE: stock-ul greșit ar contrazice copy-ul „atelierul nostru" — vezi nota per slot |

---

## PARTEA 1 — Inventar complet

### Homepage (`app/[locale]/page.tsx`)

| # | Slot | Locație în cod | Status acum | Ratio / dimensiune | Rol | Categorie |
|---|------|----------------|-------------|--------------------|-----|-----------|
| H1 | Logo Navbar | `components/Navbar.tsx:160` | SVG brand real (`/3D_Cutting_Board_Model_Design.svg`) | 1:1, 48–100px | logo | `[BRAND]` — nu se atinge |
| H2 | Logo decorativ hero | `components/Hero.tsx:285` | Același SVG, opacity 0.12, filtru sepia | 1:1, 160–320px | decor fundal | `[BRAND]` — nu se atinge |
| H3 | Tocător 3D hero | `components/CuttingBoard3D.tsx` (montat în Hero) | Three.js procedural (material oak generat în cod) | canvas | hero visual | `[DECOR-SVG]`-echivalent — nu e slot foto |
| H4 | Frunze fundal hero + crenguțe | `components/Hero.tsx` (BackgroundLeaves, TwigSVG) | SVG-uri desenate în cod | — | decor | `[DECOR-SVG]` |
| H5 | Ornamente StoryStrip | `components/StoryStrip.tsx:10-314` | 3 ilustrații SVG inline | — | decor coloane | `[DECOR-SVG]` |
| H6 | **Foto atelier** | `components/WorkshopSection.tsx:224` (`src="/workshop.webp"`) | ⚠️ Fișier REAL dar **mislabeled** — „magazine mockup", marcat „not used" în decizia /despre, totuși e LIVE pe homepage. 1,6 MB (peste regula 500KB) | 4:5, max-h 640px, 55% din grid | foto principală secțiune atelier | `[STOCK-NEUTRU]` ⚠️ — vezi P1 |
| H7 | **Galerie ProductTease desktop** (4 carduri) | `components/ProductTease.tsx:136` (surse la `:31,44,57,70`) | `/product-herbs.webp`, `/product-bread.webp`, `/product-fruit.webp`, `/product-set.webp` — imagini lifestyle din era Bolt, 1,5–2 MB fiecare | 3:2.2, card 280–360px | carduri tease produse | **DE CLARIFICAT** — vezi P2 |
| H8 | Galerie ProductTease mobil (aceleași surse) | `components/ProductTease.tsx:505` | idem H7 | 16:9, full-width | idem | idem H7 |
| H9 | **Slot video atelier** | `components/CraftVideoTease.tsx:260-281` | Placeholder gradient (radial + wood-grain lines + play button + „Video în curând") | 16:9, max-w 960px | video tease proces | `[VIDEO]` — vezi P3 |
| H10 | Logo Footer | `components/Footer.tsx:462` | SVG brand în „coin" 72px | 1:1, 72px | logo | `[BRAND]` |

*(NumbersStrip, WaitlistSection, EmailForm, FloatingCTA, PageTransition — zero sloturi media.)*

### /tocatoare (catalog)

| # | Slot | Locație în cod | Status acum | Ratio | Rol | Categorie |
|---|------|----------------|-------------|-------|-----|-----------|
| T1 | Treeline fundal hero | `components/tocatoare/tocatoare.module.css:29` (`url('/treeline.webp')`) | Asset real Vecteezy (243KB, atribuire în Footer) | 5760:1911 | fundal decorativ | `[BRAND]` — rezolvat, nu se atinge |
| T2 | Poză produs pe card | `components/tocatoare/ProductCard.tsx:43` | `hero_image_url` din Supabase (poze reale founder) | 1:1 (medallion, `tocatoare.module.css:237`) | poză produs | `[PRODUS]` — nu se atinge |
| T3 | Fallback card fără poză | `components/tocatoare/ProductCard.tsx:64` | SVG stencil + badge „Foto în pregătire" | 1:1 | fallback | `[BRAND]` — dispare automat când există poza |
| T4 | Noise texture | `tocatoare.module.css:254` | SVG data-URI în cod | — | textură | `[DECOR-SVG]` |

### PDP `/tocatoare/[slug]`

| # | Slot | Locație în cod | Status acum | Ratio | Rol | Categorie |
|---|------|----------------|-------------|-------|-----|-----------|
| P1 | Galerie principală | `components/product/ProductGallery.tsx:68` | Imagini produs din Supabase | 1:1, max-w 560px | galerie produs | `[PRODUS]` |
| P2 | Thumbnails | `components/product/ProductGallery.tsx:96` | idem | 1:1, 72px | thumbs | `[PRODUS]` |
| P3 | Fallback fără poze | `ProductGallery.tsx:33-62` | SVG stencil + badge | 1:1 | fallback | `[BRAND]` |

### Coș / checkout

| # | Slot | Locație | Status | Ratio | Rol | Categorie |
|---|------|---------|--------|-------|-----|-----------|
| C1 | Thumb produs în coș | `components/cart/CartLineItem.tsx:37` | `heroImageUrl` din snapshot produs | 1:1 mic | thumb | `[PRODUS]` |

### /despre

| # | Slot | Locație în cod | Status acum | Ratio | Rol | Categorie |
|---|------|----------------|-------------|-------|-----|-----------|
| D1 | **Banner atelier full-bleed** | `components/about/WorkshopBanner.tsx:34` (stil: `about.module.css:55,96`) | Placeholder stripat cu caption `workshop interior · golden hour · wide shot` | full-width × clamp(380–560px) — efectiv ~21:9 pe desktop, mai înalt pe mobil | banner mid-page cu text overlay | `[STOCK-NEUTRU]` ⚠️ — vezi P4 |
| D2 | Noise texture Philosophy | `about.module.css:40` | SVG data-URI | — | textură | `[DECOR-SVG]` |

*(AboutHero, ValuesGrid, ProcessTimeline — refactor 2026-05-27 a eliminat intenționat placeholder-ele foto din timeline; AboutCTA — zero sloturi.)*

### /atelier

| # | Slot | Locație în cod | Status acum | Ratio | Rol | Categorie |
|---|------|----------------|-------------|-------|-----|-----------|
| A1 | **6 carduri unelte** | `components/atelier/ToolsSection.tsx:32-34`; captions în `content.ts:182-217` (RO) / `:367-402` (EN); stil `atelier.module.css:194-195` | 6 placeholder-e stripate: `circular saw · bench`, `router · edge profile`, `4 clamps · glue line`, `electric planer · shavings`, `orbital sander · close-up`, `hand tools wall · low light` | 16:10, card ~400–600px | foto unealtă per card | `[STOCK-NEUTRU]` ⚠️ — vezi P5 |
| A2 | **2 imagini „locul"** | `components/atelier/WorkshopPlace.tsx:28-32`; stil `atelier.module.css:280-287` | Placeholder-e stripate: `workshop wide · 60sqm · east window` (h 280px) + `workbench detail · sawdust · tools` (h 220px) | ~4:3 și ~3:2 la lățimea coloanei | coloană foto stacked | `[STOCK-NEUTRU]` ⚠️⚠️ — vezi P6, cel mai sensibil slot |
| A3 | 4 thumbnails articole | `components/atelier/RelatedArticles.tsx:28`; stil `atelier.module.css:636-641` | Gradient stripat + badge „Articol în pregătire" | 16:9, card ~280px | thumb articol blog viitor | `[STOCK-NEUTRU]` — prioritate MICĂ, vezi P7 |
| A4 | Noise texture | `atelier.module.css:772` | SVG data-URI | — | textură | `[DECOR-SVG]` |

*(AtelierHero = fundal bark + tipografie, DayInAtelier / Conditions / Seasonality / ProcessSummary / PullQuote = text-only.)*

### /contact, pagini legale, auth, /multumim, /cos, /checkout

**Zero sloturi de imagine.** Toate „placeholder"-ele găsite acolo sunt text (date firmă,
input placeholders, secțiuni juridice în pregătire) — nu media.

### Landing cadouri

**Nu există în cod.** Faza 1 (2026-07-11) a livrat doar design doc + copy + photo brief
(`docs/plans/landing-cadouri-design.md`). Sloturile ei intră în inventar abia la build.

### OG / social images (colateral descoperit)

Toate paginile interioare (`despre/atelier/contact/termeni/confidentialitate/retur/page.tsx`,
const `OG_IMAGE` la top) folosesc `/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg` (logo pătrat)
declarat `1200×630` — mismatch de ratio real vs declarat. Nu e în scope-ul stock, dar notat:
un OG compus (poză produs reală + logo) ar fi un upgrade ieftin într-un task viitor.

---

## PARTEA 2 — Plan de umplere

### Decizia de infrastructură: LOCAL în `/public` (recomandat), NU hosted CDN

Verificat `next.config.js`:
- `images.remotePatterns` permite **doar** `*.supabase.co` — Pexels/Unsplash CDN ar necesita
  domenii noi în config (`images.pexels.com`, `images.unsplash.com`).
- CSP Report-Only (`next.config.js`, `img-src 'self' data: blob: https://*.supabase.co`)
  ar raporta violări pentru orice imagine hosted extern — încă un config de atins.

**Recomandare: descărcare locală în `/public`** — zero schimbări de config, control total
(fișierul nu dispare dacă Pexels îl retrage), performanță (același origin, optimizat de
`next/image`), CSP curat. Regulă obligatorie la task 2: **conversie WebP ≤ 500KB per fișier
ÎNAINTE de `git add`** (ffmpeg libwebp e disponibil — pattern treeline: q75). Numire:
`public/stock/{slot}.webp` (ex. `stock/atelier-tool-router.webp`) ca să fie evident ce e stock.

### Licențe (nota valabilă pentru toate sloturile)

- **Pexels** (License Pexels) și **Pixabay** (Content License): gratuit comercial, fără
  atribuire obligatorie, modificare permisă. **Unsplash** (Unsplash License): idem.
- NU folosim: imagini marcate „Editorial use only", conținut cu logo-uri/persoane
  identificabile fără release, colecții „Unsplash+/iStock" (plătite, apar în rezultate).
- Atribuirea NU e cerută de niciuna din cele 3 — dar păstrăm în `docs/media-credits.md`
  (task 2) sursa + URL + autor per fișier, ca evidență de licență. Pattern Vecteezy
  (atribuire vizibilă) rămâne DOAR pentru treeline, care are altă licență.

### Sloturi de umplut, în ordinea priorității

#### P1 — Homepage foto atelier (H6, `WorkshopSection.tsx:224`) — ⚠️
- **Problema dublă:** imaginea actuală e mockup mislabeled (marcată „not used" în decizia
  /despre dar live pe homepage) ȘI are 1,6 MB.
- **Alt text existent:** „mâini lucrând stejar" → stock-ul trebuie să arate exact asta.
- ⚠️ **Fără portret identificabil** — cadru strâns pe mâini + unealtă + lemn. O poză de
  „meșter cu față" ar contrazice „atelierul nostru".
- **Căutare:** `hands woodworking close up` · `hand plane wood shavings` · `carpenter hands sanding wood`
- **Target:** portret 4:5, sursă ≥1600×2000, WebP q75 ≤ 350KB. Ton cald (lemn, nu metal industrial).

#### P2 — Homepage ProductTease (H7/H8, `ProductTease.tssx:31-70`) — DE CLARIFICAT cu founder
- Cele 4 imagini (`product-herbs/bread/fruit/set.webp`) sunt din era Bolt (16 mai). **Întrebare
  pentru founder: sunt pozele TALE de produs sau stock/AI de la Bolt?**
  - Dacă sunt reale → `[PRODUS]`, rămân, dar tot trebuie **recomprimate** (1,5–2 MB fiecare = 6,9 MB pe homepage).
  - Dacă sunt de la Bolt → `[STOCK-DECOR]`, se înlocuiesc cu lifestyle stock SAU (mai bine) cu
    pozele reale de produs deja urcate în Supabase pentru catalog — zero stock necesar.
- **Căutare (doar dacă rămâne stock):** `wooden cutting board cheese` · `charcuterie board rustic table` · `bread wooden board kitchen`
- **Target:** 3:2, sursă ≥1600px lățime, WebP ≤ 300KB fiecare.

#### P3 — Slot video homepage (H9, `CraftVideoTease.tsx:260`) — [VIDEO]
- Slot 16:9 complet placeholder (nici măcar `<video>` element — buton play decorativ).
- **Opțiunea recomandată:** loop mut 10–20s, autoplay + `muted playsinline loop`, poster din
  primul frame — NU player cu sunet (secțiunea e „tease", nu documentar).
- ⚠️ Cadru fără față identificabilă; ideal doar mâini/unelte/așchii.
- **Căutare video (Pexels Videos / Pixabay Videos, gratuite comercial):**
  `wood shavings slow motion` · `hand plane woodworking video` · `oiling wooden board`
- **Target:** 1920×1080, MP4 H.264, comprimat ≤ 4–6 MB pentru loop (sau amânat: slotul
  arată intenționat „Video în curând" — poate rămâne așa până există video real din atelier).
  **Implementarea cere schimbare de cod** (element `<video>` nou) — de decis în task 2.

#### P4 — /despre banner atelier (D1, `WorkshopBanner.tsx:34`) — ⚠️
- Caption design: `workshop interior · golden hour · wide shot`. Overlay-ul spune „atelierul
  nostru" → ⚠️ un interior de atelier străin, recognoscibil (branduri de scule, hale mari
  industriale) ar contrazice copy-ul „60 mp".
- **Alternativa neutră recomandată:** cadru atmosferic generic — banc de lucru în lumină
  caldă, praf de lemn în raze de soare, perete cu scule vechi — nimic care „datează" sau
  „localizează" spațiul; fără persoane.
- **Căutare:** `woodworking workshop sunlight` · `sawdust light rays workshop` · `rustic carpenter workbench`
- **Target:** landscape lat ≥2000×900 (se taie la clamp 380–560px înălțime, text overlay pe
  treimea de jos — alege cadru cu zona de jos „liniștită"), WebP ≤ 400KB.

#### P5 — /atelier 6 carduri unelte (A1, `ToolsSection.tsx:32`) — ⚠️
- Captions = shot-directions exacte per unealtă (fierăstrău circular, router, cleme+lipire,
  rindea electrică, șlefuitor orbital, perete cu scule manuale).
- ⚠️ Textul cardurilor descrie uneltele NOASTRE → stock-ul trebuie să fie **close-up pe
  unealtă/acțiune**, nu „omul cu unealta". Fără fețe, fără branduri de scule lizibile
  (Makita/Bosch vizibil = contrazice artizanal + posibilă problemă de trademark în cadru).
- **Căutări per card:**
  1. circular saw: `circular saw wood cutting close up` · `table saw sawdust`
  2. router: `wood router edge profile` · `router woodworking close up`
  3. cleme: `wood glue clamps workbench` · `bar clamps glue up panel`
  4. rindea: `electric planer wood shavings` · `hand plane curl shavings`
  5. șlefuitor: `orbital sander wood close up` · `sanding wood dust macro`
  6. perete scule: `hand tools wall workshop` · `old woodworking tools rustic`
- **Target:** 16:10, sursă ≥1200×750, WebP ≤ 200KB fiecare (6 fișiere).

#### P6 — /atelier „locul" 2 imagini (A2, `WorkshopPlace.tsx:28-32`) — ⚠️⚠️ cel mai sensibil
- Captions: `workshop wide · 60sqm · east window` + `workbench detail · sawdust · tools`.
- ⚠️⚠️ **Cadrul „wide" e cel mai riscant slot din site**: pagina afirmă explicit „60 mp,
  fereastră pe est" — un wide-shot stock al altui atelier e o minciună verificabilă vizual
  (alte proporții, alt inventar). **Alternativa neutră recomandată:** NU folosi wide-shot;
  folosește două cadre-detaliu (colț de banc + fereastră cu lumină, detaliu blat cu așchii)
  care sugerează atmosfera fără să „documenteze" spațiul. Dacă founder-ul vrea totuși wide,
  să fie unul generic-atmosferic fără elemente memorabile.
- **Căutare:** `workbench window light` · `workshop window morning light wood` · `sawdust workbench detail`
- **Target:** ~4:3 (≥1200×900) + ~3:2 (≥1200×800), WebP ≤ 250KB fiecare.

#### P7 — /atelier thumbnails articole (A3) — prioritate MICĂ
- Cardurile sunt marcate „Articol în pregătire" — gradientul actual e onest și coerent.
- **Recomandare: NU umple acum.** Thumbnail-urile capătă sens când există articolele
  (Etapa blog); atunci fiecare primește imaginea temei (uscare lemn, end-grain, ulei+ceară,
  ghid mărimi). Dacă totuși se vrea acum: `wood drying stack` · `end grain wood texture` ·
  `beeswax oil wood finish` · `kitchen cutting boards sizes`. 16:9, ≤ 150KB.

### Ce NU se umple (confirmare explicită)

- Toate `[BRAND]` (logo-uri, treeline, fallback-uri SVG) și `[DECOR-SVG]` (ornamente,
  noise textures, 3D) — sunt decizii de design intenționate, nu goluri.
- `[PRODUS]` (catalog, PDP, coș) — pozele founder-ului din Supabase, neatinse.
- Pagini fără sloturi: /contact, legale, auth, /cos, /checkout, /multumim.

### Buget total task 2 (dacă se aprobă tot)

| Prioritate | Sloturi | Fișiere | Greutate țintă |
|------------|---------|---------|----------------|
| P1 homepage atelier | 1 | 1 foto | ≤ 350KB |
| P2 ProductTease | 0–4 | depinde de decizia founder | ≤ 1,2MB total |
| P3 video | 1 | 1 video + 1 poster | ≤ 6MB |
| P4 /despre banner | 1 | 1 foto | ≤ 400KB |
| P5 unelte | 6 | 6 foto | ≤ 1,2MB total |
| P6 locul | 2 | 2 foto | ≤ 500KB total |
| P7 articole | 0 | amânat | — |

Bonus obligatoriu task 2, indiferent de decizii: **recomprimarea** celor 5 fișiere existente
peste 500KB din `/public` (workshop.webp 1,6MB + cele 4 product-*.webp 1,5–2MB) sau
eliminarea lor dacă sunt înlocuite.
