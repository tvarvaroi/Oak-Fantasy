# Design QA — Audit complet site (2026-07-04)

> Protocol: skill `design-qa` (nou). Prod build local, 140 screenshots (337 imagini
> după segmentare), 4 viewports (375/768/1024/1440), RO+EN, stări interactive +
> reduced-motion. Review: 9 agenți paraleli pe checklist + review manual.
> Severitate: 🔴 rupt/inutilizabil · 🟡 urât/neprofesional · 🟢 polish.
>
> **Navbar-ul (🔴 #1, 🟡 #2-5) a fost REPARAT în același task (ACT 3)** — restul
> findings-urilor așteaptă prioritizarea founder-ului. NU s-a reparat nimic altceva.

## 🔴 CRITICE (rupte / blochează utilizarea)

| # | Unde | Viewport | Problema | Status |
|---|------|----------|----------|--------|
| 1 | Navbar — toate paginile | 375 + 768 | Clusterul din dreapta (RO\|EN, coș, hamburger) împins în afara viewport-ului la 375 (navigare + coș inaccesibile la load); la 768 wordmark-ul se lipea de „Atelier", RO\|EN se rupea pe 3 rânduri, CTA tăiat. Confirmat de 5 agenți independenți pe pagini diferite. | ✅ **REPARAT** (ACT 3 — drawer hamburger sub 1024px, logo redus, limba în drawer; design-qa PASS pe toate cele 4 viewports × toate stările) |
| 2 | PDP (toate produsele) | 375 | Overflow orizontal — pagina mai lată decât viewport-ul, navbar-ul împins off-canvas. | ✅ **REZOLVAT colateral de ACT 3** — verificat runtime pe build-ul nou: `scrollWidth=375=innerWidth`, hamburger vizibil. Cauza era chiar vechiul navbar (wordmark + cluster mai late decât viewport-ul). |
| 3 | Homepage ProductTease | 768 (ambele locale) | 3-4 carduri de produs cu zona de imagine complet goală (dreptunghi maro) — imaginile nu se pictează („Pâine și Casă", „Masa de Seară", „Setul Familiei"). Reproductibil pe RO+EN → nu e fluke de captură. La reduced-motion pe mobil, TOATE cele 4 imagini lipsesc. | de investigat (lazy-load + reveal sub IO) |
| 4 | /despre EN | 375 | Heading-ul secțiunii workshop („Sawdust on the floor…") invizibil — pe RO se randează, pe EN doar gol întunecat înainte de paragraf. | de investigat (culoare/stacking la boundary dark→light) |
| 5 | Checkout pas 1→2 | 375 | La prima captură progresia a eșuat (eroare stale „Alege județul." cu Cluj selectat); la recapturare a trecut. | ✅ **FALS ALARM** — verificat runtime pe build-ul nou cu click-uri reale: pas 2 atins, zero erori stale. Eșecul din captură = interceptare de click de către vechiul navbar suprapus. |

## 🟡 URÂTE / NEPROFESIONALE

**Cross-site:**
- **Footer placeholders** `[TELEFON_CONTACT] [ADRESA_ATELIER] [PROGRAM_SAMBATA] [DENUMIRE_SRL] [CUI] [REG_COM] [ADRESA_SEDIU] [ULTIMA_ACTUALIZARE]` — vizibile pe TOATE paginile, ambele locale (pe EN token-urile sunt în română). Raportat de toți cei 9 agenți. *Cunoscut din auditul de placeholder-e — blocat pe datele firmei (hand-off founder). Alternativă imediată: ascunde rândurile fără valoare.*
- **ANPC · SAL · SOL** — linkuri ~12px, sub touch-target, deși sunt linkurile cu greutate legală (mobil).

**Homepage:**
- Hero 3D: piesa de mâner a modelului randată ca **blob opac maro-închis** peste placă (375/768/1024; absent la 1440) + **umbra = poligon gri RECE cu margini dure** (contra regulii de paletă) tăiat de marginea canvas-ului.
- Legenda „Făcut cu drag în România." parțial acoperită de placa 3D (EN desktop: „Made" ascuns; tablet-l: prima literă mâncată); pe mobil se ciocnește cu indicatorul SCROLL („SCRO…" tăiat).
- WorkshopSection: bandă goală ~700-1400px între heading și quote pe mobil/tabletă — spațiu negativ de desktop necolapsat.
- CraftVideoTease: rând de glifuri-fantomă tăiate sub heading (dublura animată a titlului) — apare pe mobil+tabletă, ambele locale. Aceeași cauză ca fragmentarea H2 (vezi 🟢).
- Tranziția ProductTease→NumbersStrip: fade bark→cream de 80px prins între două secțiuni ÎNTUNECATE → dungă albicioasă ca un artefact ([ProductTease.tsx:558-565](components/ProductTease.tsx#L558-L565) — gradientul trebuie să se termine în `--forest-deep`).
- Reduced-motion: placa 3D statică supradimensionată și retezată de marginile viewport-ului (fără încadrare pentru cadrul static).

**/despre:**
- Text alb ilizibil peste partea luminoasă a imaginii de atelier (fără scrim) — mobil + tablet-p, ambele locale.
- Link-ul copper „VEZI ATELIERUL ÎN DETALIU" aproape invizibil peste imagine (toate viewports, worst desktop/tablet-l) — singurul CTA al secțiunii.

**/tocatoare (catalog):**
- Hero la ≥1024: paragraful intro + accentul italic „noastre." ilizibile peste imaginea treeline (pe mobil textul stă DEASUPRA copacilor — corect; la desktop se suprapun).

**/cos + checkout:**
- `/cos`: coliziunea H1/navbar **rezolvată colateral de navbar-ul nou** (verificat runtime: h1Top=90 vs headerBottom=88 la 375) — dar marja e de doar 2px; recomand padding-top mai generos (Batch C). Empty state rămâne: un rând de text stânga-sus + ~600-900px spațiu gol (pare neterminat).
- Checkout mobil: suprapunerea stepper/navbar era de la navbar-ul vechi (înalt); cu cel nou progresia merge (verificat runtime). Spacing-ul de sub header merită totuși verificat vizual la Batch A.

**/atelier:**
- EN: heading „The place where the work" — **propoziție neterminată** (lipsește „gets done."), confirmat în [components/atelier/content.ts:408](components/atelier/content.ts#L408).

**404 (app/not-found.tsx):**
- Pe ruta RO, body-ul e în engleză („The page you are looking for does not exist.").

## 🟢 POLISH

- H2 fragmentat de animații: [WorkshopSection.tsx:318](components/WorkshopSection.tsx#L318) (3×H2) + [ProductTease.tsx:349](components/ProductTease.tsx#L349) (2×H2) — un heading vizual = un singur `<h2>` cu `<span>`-uri animate (pattern-ul corect din Hero). Rezolvă și glifurile-fantomă CraftVideoTease. *(= finding #12 din auditul SEO)*
- Reduced-motion: ornamentele SVG draw-on (StoryStrip, crenguțe) lipsesc complet — la `prefersReduced` randează-le desenate (dashoffset 0).
- NumbersStrip: „20+ ani" se rupe pe 2 rânduri la desktop → al 4-lea bloc dezaliniat (`white-space: nowrap`).
- Hero EN: „made" orfan pe rând propriu (desktop/tablet-l); hero RO mobil: separator „·" orfan la capăt de rând; /despre: „grăbesc."/„patience," orfane la 1440 (`text-wrap: balance`).
- PDP desktop: pagina se termină după add-to-cart — 35-40% viewport gol înainte de footer; fără secțiuni details/care/shipping. *(= recomandarea PDP din auditul SEO)*
- SKU 01 „Tocător Mic": singurul fără dimensiuni (chip catalog + rând PDP lipsă) — gap de date, nu de cod.
- PDP: info-box gravare zice „o adaugi la finalizarea comenzii" dar toggle-ul e chiar sub el (+120 RON) — copy contradictoriu.
- Formulare: placeholder telefon truncat (contact tablet-l, înregistrare mobil); eroarea de email la câmp gol zice „nu este validă" în loc de „este obligatorie".
- EN: guillemets «rests» în loc de ghilimele engleze; apostrofuri drepte vs tipografice inconsistente.
- 404: buton „Înapoi acasă" ~36px (sub 44px) + pagină fără chrome de brand (fără logo/navbar/footer — generic e intenționat, logo-ul ar putea totuși apărea).
- Newsletter: label-ul și placeholder-ul identice („Adresa ta de email" × 2).
- /atelier desktop: al 6-lea card de unelte singur pe rând cu ~45% spațiu gol în dreapta.
- Cart drawer / /cos: steppere −/+ ~28px (sub 44px touch target).

## Verificate OK (fără findings)

- Cart drawer: z-order corect (peste meniu), backdrop, Esc — pe mobil ȘI desktop.
- Erorile checkout desktop: vizibile, specifice, adiacente câmpurilor (pas 1 + terms pas 3).
- /multumim cu UUID fals: 404 designat, nu crash (doar body EN — vezi 🟡 404).
- NumbersStrip counters: valorile animate corect la scroll uman (zero-urile din capturi = artefact de viteză).
- Legal + auth: PASS pe desktop/tablete (modulo placeholders footer).
- Reduced-motion /atelier + /tocatoare: tot conținutul vizibil fără scroll (checklist G PASS).
- 404 generic fără hints admin (lecția 2.3 respectată).

## Recomandare batch-uri (founder decide)

1. **Batch A (pre-lansare, blocante vizual):** #3 imagini ProductTease, #4 heading despre EN, scrim /despre + /tocatoare hero, offset /cos+checkout sub navbar, footer placeholders (ascundere condiționată până vin datele).
2. **Batch B (brand/polish vizibil):** hero 3D (blob mâner + umbră + legendă), WorkshopSection bandă goală, gradient ProductTease→NumbersStrip, H2 fragmentation (+ SEO win), atelier EN copy.
3. **Batch C (finisaj):** restul 🟢.
