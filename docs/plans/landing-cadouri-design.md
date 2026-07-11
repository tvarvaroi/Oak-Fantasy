# Landing „Cadouri personalizate" — Design doc Faza 1 (APROBAT 2026-07-11)

> Slug: **`/tocatoare-personalizate`** (EN: `/personalized-cutting-boards`) · Label nav: **„Cadouri"**
> Fundație: [docs/keyword-research-2026-07.md](../keyword-research-2026-07.md) (clusterul cadouri)
> Faza 1 = design + copy + brief foto. **Build-ul vine după sesiunea foto + produsele reale.**
> Decizii founder LOCKED: D1 slug ✅ · D2 nav Tier 1 ✅ · D3 fără configurator v1 ✅ · D4 schema ✅
> - A) Promisiunea de livrare pe dată = FEATURE FUNCȚIONAL (vezi §7 Build requirements)
> - B) Cadrul hero = PRIORITATE #1 în brief-ul foto

---

## 1. Research vizual — ce am reținut

**Modelul principal: Ugmonk** („premium fără presiune"): headline emoțional-concret, fotografie caldă lemn-și-mâini, **povestea meșterului la mijlocul paginii ca reasigurare** (nu în footer), testimoniale cu oameni reali, transparența echipei mici ca punct de vânzare, zero countdown/urgență. Peste el, mecanicile de cadou de la **Words with Boards** (analogul direct — tocătoare personalizate): gravura VIZIBILĂ în hero (piesă deja gravată cu nume), navigație pe ocazii, making-of în loc de configurator, garanție necondiționată în cuvinte umane („we will make it right"). De la **NOTHS**: auto-segmentarea pe ocazie + destinatar ca motor de navigare al cumpărătorului de cadouri.

**Principii adoptate:** (1) gravura în hero, nu blank; (2) navigație ocazie/destinatar; (3) povestea meșterului mid-page; (4) making-of > configurator; (5) garanție umană + livrare-pe-dată (gap la TOȚI — îl deținem noi); (6) proveniență concretă („stejar din Bucegi" — regula noastră de copy, confirmată de research); (7) „echipă mică" = dovadă premium, cuantificată; (8) obiect-moștenire („rămâne pe masă"), justifică tier-ul end-grain; (9) social proof legat de ocazie („cadoul preferat de la nuntă").

**Anti-patterns (interzise):** discount-hero + countdown (Oakywood avea timer stricat = moarte de credibilitate); umor-șablon („The Grillfather" — identitatea incumbentului RO la 39 lei); catalog sprawl; personalizarea ca text-field orb; stock photos sub claim handmade; enemy-framing sanitar ca unghi principal (Virginia Boys).

**Convenții RO păstrate:** promisiune de livrare above-fold (cumpărătorul de cadouri e deadline-driven); navigare pe destinatari; ANPC/SAL + date firmă (avem, placeholder-aware); review-uri puține dar bogate, legate de produs (nu ticker FOMO).

**Gap-ul nostru (ambele piețe):** nimeni nu arată obiectul în lucru sau gravura reală + nimeni nu execută „comandat azi → ajunge până la [dată]". Axa paginii: **„vezi exact ce primești și cine îl face."**

---

## 2. Structura paginii — wireframe per secțiune

Layout-ul EXTINDE limbajul vizual existent (cream-warm bg, secțiuni alternate cu paper-aged, hairlines oak, ornamente SVG discrete).

### S1 · HERO
```
┌─────────────────────────────────────────────────────────┐
│ [Navbar existent]                                        │
│                                                          │
│  EYEBROW: CADOURI DIN ATELIER            ┌────────────┐  │
│  H1: Tocătoare personalizate,            │            │  │
│      gravate în atelierul nostru.        │  FOTO HERO │  │
│  Sub: Alegi piesa, ne spui numele...     │  gravură   │  │
│                                          │  close-up  │  │
│  ┌──────────────────────┐                │  4:5       │  │
│  │ Alege piesa de gravat│  Vezi cum      │ „Maria &   │  │
│  └──────────────────────┘  funcționează→ │  Andrei”   │  │
│  ✓ Comandat azi → ajunge până la [DATĂ]  └────────────┘  │
│  Gravare de la 80 RON · ambalat de cadou                 │
└─────────────────────────────────────────────────────────┘
```
Desktop: split 55/45 text-stânga/foto-dreapta. **Mobil (375): foto SUS (3:2 crop), text sub, CTA full-width; promisiunea de dată imediat sub CTA** (elementul anti-anxietate nr. 1). Fără 3D aici — fotografia gravurii E mesajul.

### S2 · BANDĂ OCAZII (anchor-nav)
```
┌──────────┬──────────┬──────────┬──────────┐
│ Pentru   │ Pentru   │ Nunta de │ Casă     │   4 carduri 4:3,
│ nași     │ părinți  │ lemn     │ nouă     │   foto + label Caudex
│          │ și socri │ (5 ani)  │          │   → scroll la S5
└──────────┴──────────┴──────────┴──────────┘
```
Mobil: grid 2×2 (carduri ~168px, touch ≥44px). Targetează verbatim-urile AC (nași în 4 arbori!).

### S3 · CUM FUNCȚIONEAZĂ GRAVAREA
```
   ① Alegi piesa        ② Ne scrii mesajul     ③ O gravăm și o trimitem
   [icon tocător]       [icon peniță]           [icon pachet]
   text scurt           text scurt              text scurt
   ─────────────────────────────────────────────────────────
   EXEMPLE REALE (foto 1:1 ×4, carusel pe mobil):
   „Maria & Andrei · 2026” · „Pentru nașii noștri” · „Casa Popescu” · „La 5 ani de noi”
```
Mobil: pașii stacked vertical cu linie verticală de legătură; exemplele = scroll orizontal snap.

### S4 · GRID PRODUSE GRAVABILE (dinamic)
Reutilizează ProductCard-ul din `/tocatoare`, filtrat `has_engraving_option=true`, + badge „Se poate grava · +80 RON" pe card. **Se populează singur la produsele reale — zero copy hardcodat.** Mobil: 1 coloană (pattern-ul existent).

### S5 · DESTINATARI DETALIAT (4 blocuri editoriale)
```
┌────────────────────────────────────────────┐
│ [foto 3:2]   PENTRU NAȘI                   │  blocuri alternate
│              H3 + 2-3 fraze + CTA text →   │  stânga/dreapta,
└────────────────────────────────────────────┘  pattern StoryStrip/despre
```
Fiecare bloc poartă long-tail-ul lui („cadou nași nuntă personalizat" etc.) natural în H3/copy. Mobil: foto sus, text jos, per bloc.

### S6 · ATELIERUL / CINE ÎL FACE (mid-page reassurance à la Ugmonk)
Foto lată 3:2 (mâini + piesă în lucru) + 3-4 fraze persoana întâi + semnătură Caveat + link „Vezi atelierul →" (/atelier). Fundal paper-aged.

### S7 · TRUST CADOU (4 puncte, iconițe SVG line-art în stilul StoryStrip)
```
🗓 Gata de drum în 5-10     🎁 Ambalat de cadou,      ✍ Mesajul tău,     ↺ Dacă nu e bine,
   zile lucrătoare —           nu în pungă de curier      inclus             îl refacem
   azi → până la [DATĂ]
```
Mobil: 2×2 sau stacked. [DATĂ] = calcul dinamic (§7).

### S8 · FAQ + CTA FINAL
FAQ accordion (6 întrebări, §4 copy) → CTA final full-width („Alege piesa de gravat") + linie de reasigurare. FAQ = și sursa FAQPage schema.

---

## 3. Mobile-first (375px) — rezumat per secțiune

| S | La 375px |
|---|----------|
| S1 | foto 3:2 sus → H1 (clamp ~1.9rem) → sub → CTA full-width 48px → promisiune dată → notă preț |
| S2 | grid 2×2, carduri cu label peste foto (scrim jos), tap → anchor scroll |
| S3 | pași verticali cu conector; exemple = carusel orizontal snap 1:1 (~280px) |
| S4 | 1 coloană, cardul existent + badge gravare |
| S5 | 4 blocuri stacked (foto → text), separatoare hairline |
| S6 | foto full-width → text → semnătură |
| S7 | stacked, icon stânga + text dreapta (pattern listă) |
| S8 | accordion full-width, touch ≥48px pe întrebare |

La build: design-qa obligatoriu pe 375/768/1024/1440 + reduced-motion (protocolul skill-ului).

---

## 4. COPY COMPLET RO + EN

> Vocea: noi/atelier, concret peste abstract, zero „premium/exclusiv/luxury", zero „!", diacritice complete. Keywords integrate natural (bold = target, doar aici în doc, nu pe pagină).

### S1 HERO
| | RO | EN |
|---|----|----|
| Eyebrow | CADOURI DIN ATELIER | GIFTS FROM THE WORKSHOP |
| H1 | **Tocătoare personalizate**, gravate în atelierul nostru. | Personalized cutting boards, engraved in our workshop. |
| Sub | Alegi piesa, ne spui numele sau mesajul, iar noi îl gravăm în stejar masiv și îl trimitem gata de dăruit. Un cadou care rămâne pe masa lor zeci de ani. | Pick the piece, tell us the name or message, and we engrave it into solid oak and ship it ready to gift. A present that stays on their table for decades. |
| CTA primar | Alege piesa de gravat | Choose a piece to engrave |
| CTA secundar | Vezi cum funcționează | See how it works |
| Promisiune | Comandat azi, ajunge până la **[DATĂ]**. | Order today — it arrives by **[DATE]**. |
| Notă | Gravare de la 80 RON · Ambalat de cadou | Engraving from 80 RON · Gift-wrapped |

### S2 CARDURI OCAZII
| RO | EN |
|----|----|
| Pentru nași | For the godparents |
| Pentru părinți și socri | For parents & in-laws |
| Nunta de lemn — 5 ani | The wooden anniversary — 5 years |
| Pentru casă nouă | For a new home |

### S3 CUM FUNCȚIONEAZĂ
| | RO | EN |
|---|----|----|
| H2 | Cum funcționează gravarea | How engraving works |
| Pas 1 | **Alegi piesa.** Orice tocător sau platou din colecție care are opțiunea de gravare. | **Pick the piece.** Any board or platter in the collection with the engraving option. |
| Pas 2 | **Ne scrii mesajul.** Un nume, o dată, un rând scurt — îl treci la comandă, cu diacritice cu tot. | **Write your message.** A name, a date, a short line — add it at checkout, diacritics included. |
| Pas 3 | **Îl gravăm și îl trimitem.** Gravăm mesajul în lemn, în atelier, apoi ambalăm piesa de cadou și o predăm curierului. | **We engrave and ship it.** We engrave the message into the wood, in our workshop, then gift-wrap the piece and hand it to the courier. |
| Lead-in exemple | Câteva gravuri care au plecat din atelier: | A few engravings that left the workshop: |
| Exemple | „Maria & Andrei · 2026" · „Pentru nașii noștri, cu drag" · „Casa Popescu" · „La 5 ani de noi" | "Anna & Michael · 2026" · "For our godparents, with love" · "The Miller Family" · "Five years of us" |

### S4 GRID
| | RO | EN |
|---|----|----|
| H2 | Piesele care se pot grava | The pieces that can be engraved |
| Sub | Fiecare e lucrată manual din stejar masiv, apoi gravată cu mesajul tău. | Each one is handmade from solid oak, then engraved with your message. |
| Badge card | Se poate grava · +80 RON | Engravable · +80 RON |

### S5 DESTINATARI (H3 + body)
**Pentru nași** — RO: „Un **cadou pentru nași** care nu se pierde printre celelalte: un tocător din stejar masiv, cu numele lor gravat în lemn. La nuntă, la botez sau doar ca mulțumire — rămâne în bucătăria lor, la vedere, ani întregi." · EN: "A godparents' gift that doesn't get lost among the rest: a solid-oak board with their names engraved in the wood. For the wedding, the christening, or simply as a thank-you — it stays in their kitchen, in plain sight, for years."

**Pentru părinți și socri** — RO: „Pentru oamenii care v-au gătit o viață întreagă. Un platou sau un tocător gravat cu numele familiei — un **cadou personalizat pentru părinți** care se folosește zilnic, nu se ține în vitrină." · EN: "For the people who cooked for you their whole lives. A platter or board engraved with the family name — a personalized gift for parents that gets used daily, not kept behind glass."

**Nunta de lemn — 5 ani** — RO: „Cinci ani de căsnicie se sărbătoresc, prin tradiție, cu lemn. Un tocător gravat cu numele voastre și data nunții e exact ce spune tradiția — și chiar folosiți-l." · EN: "Five years of marriage are traditionally celebrated with wood. A board engraved with your names and your wedding date is exactly what the tradition asks for — and you'll actually use it."

**Pentru casă nouă** — RO: „Prima masă din casa nouă merită un început bun. Un tocător cu numele familiei sau al casei, gravat în stejar — un **cadou pentru casă nouă** care intră direct în ritmul bucătăriei." · EN: "The first meal in a new home deserves a good start. A board engraved with the family or house name — a housewarming gift that goes straight into the kitchen's rhythm."

### S6 ATELIERUL
| | RO | EN |
|---|----|----|
| Eyebrow | CINE ÎL FACE | WHO MAKES IT |
| H2 | Gravat de aceleași mâini care taie lemnul. | Engraved by the same hands that cut the wood. |
| Body | Fiecare piesă din pagina asta trece prin atelierul nostru: tăiată, șlefuită și finisată manual, apoi gravată cu mesajul tău. Nu tipărim etichete — ardem litere în lemn. | Every piece on this page goes through our workshop: cut, sanded and finished by hand, then engraved with your message. We don't print labels — we burn letters into wood. |
| Link | Vezi atelierul → | See the workshop → |

### S7 TRUST
| | RO | EN |
|---|----|----|
| 1 | **Gata de drum în 5–10 zile lucrătoare.** Comandat azi, ajunge până la [DATĂ]. | **Ready to ship in 5–10 business days.** Order today and it arrives by [DATE]. |
| 2 | **Ambalat de cadou, nu în pungă de curier.** Piesa pleacă împachetată, gata de pus sub brad sau pe masă. | **Gift-wrapped, not courier-bagged.** The piece leaves wrapped, ready for the tree or the table. |
| 3 | **Mesajul tău, inclus.** Scrii câteva rânduri la comandă și le punem pe card, lângă piesă. | **Your message, included.** Write a few lines at checkout and we add them on a card, next to the piece. |
| 4 | **Dacă nu e bine, îl refacem.** Verificăm textul cu tine înainte de gravare, iar dacă greșim noi, refacem piesa. Simplu. | **If it's not right, we remake it.** We confirm the text with you before engraving, and if we get it wrong, we remake the piece. Simple. |

### S8 FAQ
1. **RO: Ajunge până la data de care am nevoie?** — Lucrăm fiecare piesă la comandă, în 5–10 zile lucrătoare, apoi predăm curierului. La fiecare produs vezi data estimată de livrare calculată pentru ziua în care comanzi. Dacă e o dată fixă (nuntă, aniversare), scrie-ne înainte și îți confirmăm.
   **EN: Will it arrive by the date I need?** — Each piece is made to order in 5–10 business days, then handed to the courier. Every product shows an estimated delivery date calculated for the day you order. For a fixed date (wedding, anniversary), write to us first and we'll confirm.
2. **RO: Ce pot grava?** — Un nume, o dată, un rând scurt — cu diacritice cu tot. Textul îl scrii la comandă; dacă vrei altceva (un monogram, un desen simplu), scrie-ne și vedem împreună ce se poate.
   **EN: What can I engrave?** — A name, a date, a short line — special characters included. You add the text at checkout; for anything else (a monogram, a simple drawing), write to us and we'll see what's possible.
3. **RO: Cum arată gravura?** — Laserul arde literele în lemn: adâncite, maro-închis, cu marginile curate. Nu e vopsea și nu se șterge — face parte din lemn.
   **EN: What does the engraving look like?** — The laser burns the letters into the wood: recessed, dark brown, clean-edged. It's not paint and it doesn't wash off — it's part of the wood.
4. **RO: Pot vedea cum va arăta înainte?** — Îți confirmăm textul exact înainte să gravăm. Nu avem încă o simulare pe ecran — dar pozele din pagina asta sunt gravuri reale, așa va arăta și a ta.
   **EN: Can I see it before it's made?** — We confirm your exact text before engraving. We don't have an on-screen preview yet — but the photos on this page are real engravings; yours will look the same.
5. **RO: Cum se întreține un tocător gravat?** — Exact ca unul negravat: spălat cu mâna, uleiat din când în când. Gravura nu iese la spălare și nu reține mirosuri.
   **EN: How do I care for an engraved board?** — Exactly like a plain one: hand wash, oil now and then. The engraving doesn't wash out and doesn't hold odors.
6. **RO: Dacă am greșit textul?** — Îl verificăm cu tine înainte de gravare, deci ai un moment în care poți corecta. Dacă greșeala e a noastră, refacem piesa pe costul nostru.
   **EN: What if I made a typo?** — We confirm the text with you before engraving, so you get a moment to correct it. If the mistake is ours, we remake the piece at our cost.

### CTA FINAL
RO: H2 „Un cadou lucrat, nu cumpărat în fugă." + buton „Alege piesa de gravat" + notă „5–10 zile lucrătoare · gravare de la 80 RON · refacem dacă nu e bine"
EN: H2 "A gift that was made, not grabbed." + button "Choose a piece to engrave" + note "5–10 business days · engraving from 80 RON · we remake it if it's not right"

---

## 5. SEO

- **Slug:** `/tocatoare-personalizate` ↔ `/personalized-cutting-boards` (PATHNAMES: `cadouri: { ro: 'tocatoare-personalizate', en: 'personalized-cutting-boards' }` — cheia internă `cadouri` e OK, slug-urile contează).
- **Title RO:** „Tocătoare Personalizate cu Gravură — Cadouri din Stejar Masiv | Oak Fantasy" · **EN:** "Personalized Cutting Boards, Laser Engraved — Oak Fantasy"
- **Meta desc RO:** „Tocătoare din stejar masiv, gravate cu numele sau mesajul tău. Cadouri personalizate pentru nași, părinți, nuntă sau casă nouă. Lucrate manual, în 5–10 zile."
- **H-structure:** H1 unic (hero), H2 per secțiune, H3 pe destinatari — heading-uri SEMANTICE întregi (lecția H2 fragmentation).
- **Schema:** BreadcrumbList + ItemList (produsele gravabile, `Product` cu `offers`, publisher `{'@id': #organization}`) + FAQPage din S8 (pentru citabilitate AI — Google nu mai dă rich results pe FAQ, decizie asumată D4).
- **Navigație:** Navbar Tier 1 label „Cadouri" (poziția 2: Tocătoare · **Cadouri** · Atelier · Despre · Contact) + Footer NAVIGARE mirror + tease homepage (după ProductTease) + cross-link din PDP-urile cu gravare („Îl faci cadou? Vezi gravarea →"). Sitemap: intră automat via PATHNAMES în app/sitemap.ts.
- **Interlinking:** landing → PDP-uri gravabile; landing → /atelier (S6); viitor blog „nunta de lemn" → landing.

## 6. DESIGN SPEC BRIEF — pentru Claude Design (self-contained)

> Copiabil direct în Claude Design. Nu presupune acces la codebase.

**Brand:** Oak Fantasy — atelier românesc care face tocătoare din stejar masiv, lucrate manual, cu gravare laser. Ton: cald, artizanal, înrădăcinat; „premium Etsy artisan" + „Apartamento magazine". NU corporate-minimal, NU Aesop-clean, zero urgență/discount-uri.

**Tokens (exacte):**
- Culori primare: forest-deep `#2D3A1F` · forest-mid `#5A6B3C` · moss `#8FA068` · oak-warm `#8B5E3C` (accent principal + CTA-uri) · oak-deep `#5C3A20` · copper `#B87333` (eyebrows, accente fine)
- Fundaluri: cream-warm `#F5EBD8` (bg principal) · paper-aged `#EDE0C5` (secțiuni alternate) · bark `#1F1810` (doar dacă e nevoie de secțiune dark — pe landing-ul ăsta NU recomand)
- Text: ink `#2A2218` (niciodată negru pur) · ink-soft `#5D4E3A` · highlight `#C9A66B`
- Regulă absolută: toate culorile calde; zero gri rece, alb pur, negru pur.
- Fonturi: **Caudex** (serif, 400/700) = display/heading-uri + labels uppercase cu letter-spacing 0.18em; **Lora** (serif, 400/500) = body; **Caveat** (script, 400/600) = RAR, doar semnături/exemple de gravură scrise de mână.
- Ritm: secțiuni cu padding vertical generos (~100-120px desktop / 60-70px mobil), max-width conținut 1200px, colțuri rotunjite 8-12px, hairlines `rgba(139,94,60,0.2)`, umbre calde difuze `rgba(31,24,16,0.1-0.2)`.
- Butoane: fundal oak-warm `#8B5E3C`, text cream-warm, radius 6-8px, fără gradiente stridente.

**Structura (ordinea exactă + conținut):** cele 8 secțiuni din §2, cu copy-ul din §4 (folosește textele RO ca atare). Slot-uri foto de rezervat: hero **4:5 portrait** (crop 3:2 pe mobil) — gravură close-up cu nume; ocazii 4× **4:3**; exemple gravuri 4× **1:1**; destinatari 4× **3:2**; atelier 1× **3:2 wide**. Folosește placeholder-e calde (nu gri) cu eticheta cadrului.

**Referințe de principiu (nu de copiat):** Ugmonk (căldură editorială, poveste de meșter mid-page, zero presiune), Words with Boards (gravura vizibilă în hero, ocazii), NOTHS (carduri destinatar). Evită: countdown, badge-uri de discount, grid-uri aglomerate, iconografie corporate rece.

**Elemente de layout existente pe site (de continuat, nu reinventat):** navbar fix cu logo + link-uri serif; secțiuni alternate cream/paper-aged; eyebrow-uri copper uppercase; ornamente SVG line-art subțiri (crenguțe de stejar, 1.5px stroke, oak-warm/forest-mid) folosite discret ca separatoare; footer dark bark.

## 7. BUILD REQUIREMENTS (pentru faza de implementare — NU acum)

1. **🗓 Promisiunea de livrare pe dată = FEATURE FUNCȚIONAL** (cerință founder A): `[DATĂ]` din hero/S7/FAQ se calculează dinamic: `azi + lead-time producție (5–10 zile lucrătoare, worst-case 10) + estimare curier (1–2 zile lucrătoare)`, sărind weekendurile și sărbătorile legale RO (lista sărbătorilor = constantă anuală în lib/config, actualizată manual). Afișare: „ajunge până la marți, 28 iulie" (format Intl ro-RO/en-US, fără oră). Server-rendered cu revalidare zilnică SAU client-side după hydration (decizie la build; atenție la ISR — data NU are voie să înghețe în cache mai mult de o zi). Aceeași logică refolosibilă pe PDP.
2. Rută: `app/[locale]/tocatoare-personalizate/page.tsx` + PATHNAMES key `cadouri` + middleware (zero schimbări — route-key generic) + Navbar/Footer/sitemap.
3. Grid S4 = `fetchActiveProducts()` filtrat `has_engraving_option` (refolosește ProductCard + stock overlay existent).
4. FAQ accordion = component nou (Radix Accordion din components/ui dacă există, altfel details/summary stilizat).
5. Gate-uri standard: brainstorming la build pe orice deviație de la acest doc + design-qa 4 viewports + reduced-motion + regen baselines (+ pagină nouă în visual-regression.spec.ts + New Page Accessibility Checklist #0-Tier1).
6. Poze: build-ul NU pornește fără cadrele P1 din [landing-cadouri-photo-brief.md](landing-cadouri-photo-brief.md).
