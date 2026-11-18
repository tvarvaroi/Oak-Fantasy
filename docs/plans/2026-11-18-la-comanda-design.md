# La comandă (/la-comanda) + admin „Comenzi custom" — design aprobat

> Aprobat de founder: 2026-11-18 (a doua iterație — fluxul cu formular).
> Prima iterație (buton WhatsApp direct + introducere manuală în admin) a fost
> respinsă în favoarea fluxului de mai jos.

## Flux

1. Clientul completează fișa (nume, telefon, idee) pe `/ro/la-comanda` sau `/en/custom-orders`.
2. Server action: Zod → honeypot → timing check (< 2s) → rate limit 5/oră/IP → insert
   cu service role (fără policy anon) → email best-effort către admin.
3. Cererea apare în `/admin/comenzi-custom` cu status „Nouă" + badge în sidebar.
4. Founder-ul îl contactează pe WhatsApp (link wa.me pe telefon, mesaj precompletat
   în limba clientului).

Nu atinge checkout-ul, coșul sau stocul.

## Schema — `custom_orders`

`id uuid` · `customer_name` (2–80) · `customer_phone` (normalizat `+40XXXXXXXXX`) ·
`description` (10–2000) · `status` (`new|contacted|in_progress|completed|cancelled`) ·
`locale` (`ro|en`, dedus din pagină) · `internal_notes` · `created_at` · `updated_at`.
RLS: doar „Admin full access" prin `is_admin()`. DELETE real permis (decizie founder).

Statusuri: Nouă → Contactat → În lucru → Finalizată, plus Anulată.

## Pagina publică

1. Hero (cream): eyebrow + H1 „Ai o idee? O facem în lemn." + sub-text; în dreapta
   (sub text pe mobil) **fișa de comandă** paper-aged = formularul (`#formular`),
   cu nota de acord (link confidențialitate) + nota de retur (OUG 34/2014 art. 16 lit. c).
2. Ce putem face (5 exemple, H3) — **slot galerie** imediat după, nerandat.
3. Cum lucrăm (3 pași).
4. CTA final (bark) → ancoră `#formular` + focus pe Nume.

Fără buton WhatsApp, fără preț, fără coș. SEO: un H1, JSON-LD WebPage + BreadcrumbList
+ Service (provider → `#organization`). PATHNAMES `laComanda`, sitemap, hreflang.

Navigare: Navbar „La comandă" pe poziția 3 (desktop + drawer), strângere doar pe lg–xl
dacă nu încape la 1024; Footer „Navigare"; teaser homepage între ProductTease și
NumbersStrip.

## Admin

- Sidebar „Comenzi custom" sub „Comenzi" + badge cu cererile `new`.
- `/admin/comenzi-custom`: filtre pill pe status, tabel (Primită, Client, Telefon wa.me,
  Ideea trunchiată, Status, Deschide →).
- `/admin/comenzi-custom/[id]`: idee completă, buton WhatsApp, status + note, ștergere cu
  AlertDialog.
- Dashboard: StatCard „Cereri custom noi" → `?status=new`.
- Email admin `[Oak Fantasy] Cerere la comandă — {nume}` (Resend, best-effort).

## Copy

Sursa de adevăr: `components/la-comanda/content.ts` (RO + EN).

## Verificare

E2E fără scrieri în DB (validare, linkuri, ancoră, nav 1024/1280, teaser, SEO).
Trimiterea reală doar în `scripts/smoke-custom-orders.mjs` (submit → DB `new` → badge 1 →
status + notă → delete → badge 0; anon nu citește/inserează; honeypot + timing resping).
