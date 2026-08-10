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
| `public/stock/atelier-tool-planer.webp` | /atelier · Tools 4 (P5) | https://www.pexels.com/photo/crop-artisan-flattening-lumber-on-planer-in-workroom-5974016/ | Ono Kosuki | Pexels License |
| `public/stock/atelier-tool-sander.webp` | /atelier · Tools 5 (P5) | https://www.pexels.com/photo/close-up-of-sanding-wood-5466146/ | adventurestudio | Pexels License |
| `public/stock/atelier-tool-hand-tools.webp` | /atelier · Tools 6 (P5) | https://www.pexels.com/photo/set-of-professional-tools-on-wall-5973878/ | Ono Kosuki | Pexels License |
| `public/stock/atelier-place-window.webp` | /atelier · WorkshopPlace sus (P6) | https://www.pexels.com/photo/12591659/ | Cmoon | Pexels License |
| `public/stock/atelier-place-sawdust.webp` | /atelier · WorkshopPlace jos (P6) | https://www.pexels.com/photo/close-up-shot-of-sawdust-and-tools-on-a-wooden-surface-6790748/ | Tima Miroshnichenko | Pexels License |
| `public/stock/craft-loop.mp4` | Homepage · CraftVideoTease (P3, video) | https://www.pexels.com/video/carpentry-tools-and-wood-shavings-6790014/ | Tima Miroshnichenko | Pexels License |
| `public/stock/craft-loop-poster.webp` | Poster/fallback pentru craft-loop.mp4 (primul cadru al aceluiași video) | idem video | Tima Miroshnichenko | Pexels License |

## Reguli respectate la selecție (din task + media-inventory)

- Zero fețe identificabile (cadru pe mâini/unelte/material).
- Zero branduri de scule lizibile în cadru.
- Zero wide-shot de atelier străin — doar cadre-detaliu (P6), ca imaginea să nu
  contrazică copy-ul despre spațiul nostru real.
- Procesare: crop + conversie WebP (ffmpeg libwebp q78–82), imagini ≤ 500KB;
  video re-encodat H.264 1080p CRF 28, fără audio, `faststart`, 1,8MB.

## Verificare licență la adăugare de fișiere noi

Orice asset stock nou intră în tabelul ăsta ÎNAINTE de commit, cu: fișier local,
slot, URL-ul paginii sursă, autor, licența exactă. Surse acceptate: Pexels License,
Unsplash License, Pixabay Content License (toate: gratuit comercial, fără atribuire).
Nu folosim imagini „Editorial use only" sau din colecțiile plătite (Unsplash+/iStock).
