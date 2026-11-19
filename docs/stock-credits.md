# Stock media credits — surse și licențe

> Creat: 2026-08-10 (Task 2 — umplere media cu stock, din docs/media-inventory.md)
> Toate asseturile stock de mai jos provin de pe **Pexels** și sunt folosite sub
> **Licența Pexels** (https://www.pexels.com/license/): gratuit pentru uz comercial,
> modificare permisă, **fără atribuire obligatorie**. Păstrăm totuși evidența
> completă aici, ca dovadă de licență per fișier.
>
> Notă separată: `public/treeline.webp` provine de la **Vecteezy** (licență free
> cu atribuire obligatorie — link-ul „Tree PNGs by Vecteezy" din Footer rămâne).
> Pozele din `public/products/` NU sunt stock — sunt fotografiile de produs ale
> fondatorului (extrase din Supabase Storage pentru secțiunea statică ProductTease).

| Fișier local | Slot | Sursă (pagina foto) | Autor | Licență |
|---|---|---|---|---|
| `public/stock/workshop-hands-plane.webp` | Homepage · WorkshopSection (P1) | https://www.pexels.com/photo/man-planing-wooden-plank-with-manual-tool-5974239/ | Ono Kosuki | Pexels License |
| `public/stock/despre-banner-workbench.webp` | /despre · WorkshopBanner (P4) | https://www.pexels.com/photo/5089154/ | cottonbro studio | Pexels License |
| `public/stock/atelier-tool-circular-saw.webp` | /atelier · Tools 1 (P5) | https://www.pexels.com/photo/close-up-photo-of-wood-getting-cut-by-a-table-saw-7492584/ | cottonbro studio | Pexels License |
| `public/stock/atelier-tool-router.webp` | /atelier · Tools 2 (P5) | https://www.pexels.com/photo/carpenter-operating-wood-planer-in-workshop-37178403/ | Nguyendesigner | Pexels License |
| `public/stock/atelier-tool-clamps.webp` | /atelier · Tools 3 (P5) | https://www.pexels.com/photo/carpentry-metal-equipment-with-wooden-handles-10066173/ | Harold Granados | Pexels License |
| `public/stock/atelier-tool-planer.webp` | ~~/atelier · Tools 4 (P5)~~ → din 2026-11-19 doar în slideshow-ul CraftVideoTease (ascuns) | https://www.pexels.com/photo/crop-artisan-flattening-lumber-on-planer-in-workroom-5974016/ | Ono Kosuki | Pexels License |
| `public/stock/atelier-tool-hand-planer.webp` | /atelier · Tools 4 „Rindea electrică” (2026-11-19) | https://www.pexels.com/photo/a-man-scraping-a-wood-with-electric-wood-scraper-14441384/ | NSHCVKS HXJSG | Pexels License |
| `public/stock/atelier-tool-sander.webp` | /atelier · Tools 5 (P5) | https://www.pexels.com/photo/close-up-of-sanding-wood-5466146/ | adventurestudio | Pexels License |
| ~~`public/stock/atelier-tool-hand-tools.webp`~~ | ȘTERS 2026-11-19 (dălțile nu sunt în atelier — fact-check fondator) | https://www.pexels.com/photo/set-of-professional-tools-on-wall-5973878/ | Ono Kosuki | Pexels License |
| `public/stock/atelier-tool-cnc.webp` | /atelier · Tools „Freză CNC” (2026-11-19) | https://www.pexels.com/photo/7480234/ | cottonbro studio | Pexels License |
| `public/stock/atelier-tool-laser.webp` | /atelier · Tools „Gravare laser” (2026-11-19) | https://www.pexels.com/photo/38030790/ | soc-nang-d-ng (Pexels) | Pexels License |
| `public/stock/atelier-place-window.webp` | /atelier · WorkshopPlace sus (P6) | https://www.pexels.com/photo/12591659/ | Cmoon | Pexels License |
| `public/stock/atelier-place-sawdust.webp` | /atelier · WorkshopPlace jos (P6) | https://www.pexels.com/photo/close-up-shot-of-sawdust-and-tools-on-a-wooden-surface-6790748/ | Tima Miroshnichenko | Pexels License |

> **2026-10-15 (QA & Polish):** `craft-loop.mp4` + `craft-loop-poster.webp` (video Pexels
> 6790014, Tima Miroshnichenko) au fost ȘTERSE din repo. CraftVideoTease e acum un
> slideshow crossfade din 5 stills deja licențiate mai sus: `atelier-tool-planer`,
> `atelier-tool-clamps`, `atelier-place-sawdust`, `atelier-tool-hand-tools`,
> `atelier-tool-sander` (sloturi suplimentare: Homepage · CraftVideoTease).
> `atelier-tool-hand-tools.webp` nu mai apare pe /atelier (cardul „Set unelte de mână"
> a fost scos) — rămâne folosit doar în slideshow.

## Reguli respectate la selecție (din task + media-inventory)

- Zero fețe identificabile (cadru pe mâini/unelte/material).
- Zero branduri de scule lizibile în cadru.
- Zero wide-shot de atelier străin — doar cadre-detaliu (P6), ca imaginea să nu
  contrazică copy-ul despre spațiul nostru real.
- Procesare: crop + conversie WebP (ffmpeg libwebp q78–82), imagini ≤ 500KB.

## Verificare licență la adăugare de fișiere noi

Orice asset stock nou intră în tabelul ăsta ÎNAINTE de commit, cu: fișier local,
slot, URL-ul paginii sursă, autor, licența exactă. Surse acceptate: Pexels License,
Unsplash License, Pixabay Content License (toate: gratuit comercial, fără atribuire).
Nu folosim imagini „Editorial use only" sau din colecțiile plătite (Unsplash+/iStock).

> **2026-11-19:** poza veche de la „Rindea electrică” arăta o mașină staționară de rindeluit,
> nu o rindea de mână. Înlocuită cu Pexels 14441384 — singura rindea electrică DE MÂNĂ găsită
> pe Pexels fără brand lizibil, după 7 căutări (respinse după verificare vizuală: 7109995,
> 7109999 „STANLEY”, 6790088 — rindele manuale; 18948978 Makita; 374049, 6790107 — fețe /
> unelte manuale; 8821530 — polizor unghiular; 38251141 — Metabo, din descriere). Fotografia originală arată fața
> lucrătorului → **decupată** (Licența Pexels permite modificarea): doar mâna cu mănușă,
> rindeaua și blocul de lemn; cablul cu fire desfăcute din dreapta e scos din cadru. Ușoară
> corecție de culoare spre cald (ffmpeg `colorbalance`) + denoise; cadru peisaj ~1,5:1
> (ca să încapă mâna, rindeaua și blocul în cardul `object-fit: cover`), 1100×734 WebP q72 = 152 KB.
> Fișierul vechi `atelier-tool-planer.webp` rămâne doar pentru slideshow-ul ascuns.

> **2026-11-19 (fact-check fondator):** /atelier are 7 unelte — adăugate „Freză CNC” (Pexels 7480234,
> capul frezei + așchii, fără brand) și „Gravare laser” (Pexels 38030790, cap de gravor deasupra unui
> bloc de lemn; literele gravate nu formează un brand). Respinse: 7254428 / 7254423 (Opt Lasers, brand),
> 10119306 (etichete pe ax), 17260646 (avertizări + etichete lizibile). Procesare: crop 3:2, 1100 px,
> `colorbalance` spre cald + `hqdn3d`, WebP q72 (19 KB și 21 KB — cadre cu mult bokeh). Toate pozele
> stock de pe /atelier, /despre și homepage poartă acum mențiunea „Fotografii ilustrative.” /
> „Fotografie ilustrativă.” Slideshow-ul ascuns CraftVideoTease are 4 cadre (dălțile scoase).
