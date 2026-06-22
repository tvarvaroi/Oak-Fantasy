# Oak Fantasy — Pre-Launch Security Checklist

> **Document scop:** Audit complet de securitate înainte de lansare publică  
> **Status:** Living document, actualizat la fiecare sprint  
> **Owner:** Theodor + Claude Code (auto-update după task-uri sensibile)  
> **Ultima actualizare:** 2026-XX-XX (TBD la creare în repo)

---

## TL;DR pentru pre-launch

**Înainte de a conecta domeniul oakfantasy.ro și a face site-ul public:**

1. ✅ Rotește TOATE API keys care au fost expuse în comunicare (chat, email, etc.)
2. ✅ Verifică zero secrete commit-uite în git history
3. ✅ Confirmă toate env vars în Vercel (Production + Preview + Development separate)
4. ✅ Stripe + e-Factura switch din test mode → live mode
5. ✅ Înlocuiește toate `[PLACEHOLDER]` cu info reale
6. ✅ DNS records configured (SPF, DKIM, DMARC pentru Resend)
7. ✅ Rate limiting activ pe toate endpoint-urile publice
8. ✅ HTTPS-only enforced (no HTTP fallback)
9. ✅ Backup Supabase production database
10. ✅ Monitoring + alerts setup (Sentry, Speed Insights, Vercel logs)

---

## 1. API Keys & Secrets — DE ROTAT PRE-LAUNCH

### 1.1 Resend API Key

- **Cheie curentă:** `re_GnEqPV...***REDACTED*** (vezi env var Vercel)`
- **Status:** ⚠️ EXPUSĂ în chat strategic cu Claude (mesaj 2026-XX-XX)
- **Acțiune pre-launch:**
  1. Resend dashboard → API Keys → Revoke key curent
  2. Create new key: name `oak-fantasy-production`, full access
  3. Update în Vercel env var `RESEND_API_KEY` (Production only)
  4. Test: trimite un email de test, confirmă livrare
  5. Pentru development local: creează separat `oak-fantasy-development` key

**Best practice:** key separat per environment (dev / preview / production).

### 1.2 Supabase Service Role Key

- **Status:** Folosită pentru operațiuni admin server-side (skip RLS)
- **Locație curentă:** Vercel env var `SUPABASE_SERVICE_ROLE_KEY`
- **Risc:** Dacă e expusă, atacatorul are acces complet la database
- **Acțiune pre-launch:**
  1. Supabase dashboard → Settings → API → Reset service role key
  2. Update în Vercel env vars
  3. Confirmă restart pe toate deployment-urile

### 1.3 Supabase Anon Key

- **Status:** Public-safe (cu RLS activ), dar dacă RLS e configurat greșit = leak
- **Locație:** Vercel env var `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Acțiune pre-launch:**
  1. Audit RLS policies pe toate tabelele
  2. Test manual: încearcă să accesezi tabela `profiles` ca anonymous user — trebuie să fie DENY
  3. Test: încearcă să faci INSERT pe `orders` ca user neautentificat — DENY
  4. Documentează în brain RLS policies finale

### 1.4 Stripe Secret Key

- **Status:** Va fi creat la Sprint 3
- **Test mode key:** `sk_test_...` (sigur de folosit în dezvoltare)
- **Live mode key:** `sk_live_...` (NU se folosește decât în production env)
- **Acțiune pre-launch:**
  1. Stripe dashboard → activate Business account (KYC verification)
  2. Switch din test mode → live mode
  3. Generate live API key
  4. Update în Vercel env var `STRIPE_SECRET_KEY` DOAR în Production environment
  5. În Preview și Development: păstrează test key

### 1.5 Stripe Webhook Signing Secret

- **Status:** Va fi creat la Sprint 3 (când setezi webhook endpoint)
- **Risc:** Dacă e expusă, atacatorul poate forja webhook events fake → fake comenzi confirmate
- **Acțiune pre-launch:**
  1. Stripe dashboard → Webhooks → endpoint production
  2. Reveal signing secret, copy
  3. Add în Vercel env var `STRIPE_WEBHOOK_SECRET`
  4. Test: trimite un eveniment de test din Stripe dashboard, verifică verificarea semnăturii

### 1.6 Google OAuth Client Secret

- **Status:** Va fi creat la Sprint 2
- **Locație:** Google Cloud Console → APIs & Services → Credentials
- **Acțiune pre-launch:**
  1. Verifică authorized redirect URIs (doar oakfantasy.ro/auth/callback, nu localhost în production)
  2. Restrict OAuth consent screen (logo, terms, privacy)
  3. Submit pentru verification dacă peste 100 users (necesar pentru "Verified" badge Google)

### 1.7 SmartBill API Key (e-Factura)

- **Status:** Va fi creat la Sprint 4
- **Acțiune pre-launch:**
  1. SmartBill account business verified
  2. Generate API token cu permisiuni minimum necesare (issue invoice + read status)
  3. Add în Vercel env var `SMARTBILL_API_TOKEN`
  4. Test în SmartBill sandbox cu factură de test

### 1.8 ANAF e-Factura OAuth (dacă integrăm direct)

- **Status:** Probabil amânat — folosim SmartBill ca intermediar
- **Alternativ:** dacă integrăm direct cu ANAF SPV → token OAuth cu rotație
- **Decizie:** TBD la Sprint 4

---

## 2. Environment Variables — Audit Complet

### 2.1 Production env vars (Vercel)

Variabile așteptate la pre-launch:

```
# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co (production project)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (public-safe)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (SECRET, server-side only)

# Email
RESEND_API_KEY=re_... (production key, rotated)
RESEND_FROM_EMAIL=noreply@oakfantasy.ro
RESEND_ADMIN_EMAIL=info@oakfantasy.ro
RESEND_REPLY_TO=info@oakfantasy.ro

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_... (public-safe, browser-side)
STRIPE_SECRET_KEY=sk_live_... (SECRET, server-side)
STRIPE_WEBHOOK_SECRET=whsec_... (SECRET)

# OAuth
GOOGLE_OAUTH_CLIENT_ID=... (public-safe)
GOOGLE_OAUTH_CLIENT_SECRET=... (SECRET)

# e-Factura
SMARTBILL_API_TOKEN=... (SECRET)
SMARTBILL_CIF=... (firma CIF)

# Monitoring (optional)
SENTRY_DSN=... (public-safe pentru client, dar private pentru server)

# App config
NEXT_PUBLIC_APP_URL=https://oakfantasy.ro
NEXT_PUBLIC_DEFAULT_LOCALE=ro
```

### 2.2 Verificare separation environments

**Critical:** test keys NU trebuie să ajungă în Production. Vercel permite scoping per env:

```
Production    → live keys (Stripe live, Resend prod, etc.)
Preview       → test keys (sigur pentru PR previews)
Development   → test keys + local .env.local
```

**Pre-launch action:** review în Vercel dashboard toate env vars și confirmă scope corect.

---

## 3. Git History — Audit Secrete Commit-uite

### 3.1 Verifică nimic compromis în history

Pre-launch check:

```bash
# Caută patterns de API keys în history
git log --all --pretty=format: --name-only --diff-filter=A | sort -u | \
  xargs -I{} git log -p --all -- {} 2>/dev/null | \
  grep -E "(sk_live|re_|whsec_|SUPABASE_SERVICE)" | head -20

# Caută .env files commit-uite din greșeală
git log --all --pretty=format: --name-only | grep -E "\.env(\.|$)" | sort -u
```

Așteptat: zero matches. Dacă apare ceva → rotire imediată + git history cleanup cu BFG sau git-filter-repo.

### 3.2 .gitignore audit

Confirmă în `.gitignore`:

```
# Environment
.env
.env.local
.env*.local

# Dependencies
node_modules/

# Build artifacts
.next/
out/

# Testing temporary evidence
tests/qa-screenshots/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Local backup
*.backup
*.bak
```

---

## 4. Placeholder-uri Legale — Înlocuire Pre-Launch

### 4.1 Locații cu placeholder-uri

Lista exhaustivă (de actualizat pe măsură ce Claude Code adaugă):

```
[DENUMIRE_SRL]      → app/[locale]/termeni/page.tsx          [SLOT FILLED 2026-06-18 skeleton]
                    → app/[locale]/confidentialitate/page.tsx [SLOT FILLED 2026-06-18 skeleton]
                    → app/[locale]/retur/page.tsx             [SLOT FILLED 2026-06-18 skeleton]
                    → app/[locale]/contact/page.tsx           [SLOT FILLED 2026-06-16]
                    → components/Footer.tsx (legal info block)
  Sprint 1 closure:   All 4 legal/contact pages now ship as skeletons.
                    Pre-launch task: populate NEXT_PUBLIC_COMPANY_NAME
                    + the 10 other env vars below; lawyer fills
                    the section bodies in components/legal/*/content.ts
                    (LegalPlaceholder bodies). No code change required
                    once env vars + content land.

[CUI]               → toate paginile legale + Footer

[REG_COM]           → toate paginile legale + Footer
                    → format: J{judet}/{numar}/{an}

[ADRESA_SEDIU]      → toate paginile legale
                    → Footer

[ADRESA_ATELIER]    → /atelier page
                    → /contact page
                    → poate fi diferită de sediul social

[EMAIL_CONTACT]     → /contact page (display)
                    → Footer
                    → email templates Resend
                    → variabilă env RESEND_ADMIN_EMAIL
  TODO 2026-06-16:    founder decide email final (info@ vs alt) înainte
                    de a popula NEXT_PUBLIC_CONTACT_EMAIL pe Vercel.
                    Curent: LEGAL_INFO.contactEmail default
                    'info@oakfantasy.ro'.

[TELEFON_CONTACT]   → /contact page (optional)
                    → Footer (optional)

[CONT_BANCAR_IBAN]  → Termeni (pentru ramburs/transfer bancar)
                    → optional, doar dacă oferi plată prin transfer

[REPREZENTANT_LEGAL] → Termeni (semnatarul contractului)

[CAEN_PRINCIPAL]    → confidentialitate (descriere activitate)
                    → ex: "1629 - Fabricarea altor produse din lemn"

[CAPITAL_SOCIAL]    → Termeni (datele firmei)
                    → format: "{suma} RON"
```

### 4.2 Procedură înlocuire

**Find & replace pre-launch:**

```bash
# Verifică ce placeholder-uri mai există
grep -rn "\[DENUMIRE_SRL\]\|\[CUI\]\|\[REG_COM\]\|\[ADRESA_" \
  app/ components/ --include="*.tsx" --include="*.ts"

# Pentru fiecare match: înlocuiește cu valoarea reală
# RECOMANDARE: folosește un singur fișier centralizat
```

**Best practice:** creează `lib/legal-info.ts`:

```typescript
export const LEGAL_INFO = {
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? '[DENUMIRE_SRL]',
  cui: process.env.NEXT_PUBLIC_COMPANY_CUI ?? '[CUI]',
  regCom: process.env.NEXT_PUBLIC_COMPANY_REG_COM ?? '[REG_COM]',
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? '[ADRESA_SEDIU]',
  // ...
}
```

Apoi în pagini: `import { LEGAL_INFO } from '@/lib/legal-info'` + `{LEGAL_INFO.companyName}`.

**Avantaj:** placeholders sunt în UI, dar înlocuirea se face printr-un singur set de env vars la pre-launch.

---

## 5. Domain & DNS Setup Pre-Launch

### 5.1 Achiziție domeniu

- [ ] oakfantasy.ro înregistrat la registrar (ex: ROTLD direct, sau Namecheap/Gandi)
- [ ] DNSSEC activat
- [ ] WHOIS privacy ON (dacă disponibil pentru .ro)

### 5.2 DNS records pentru Vercel + Resend

**Vercel domain connection:**

```
Type    Name    Value                            TTL
A       @       76.76.21.21                      3600
AAAA    @       2606:4700:90:0:f22e:fbec:5bed   3600
CNAME   www     cname.vercel-dns.com             3600
```

**Resend email authentication:**

```
Type    Name              Value                                          TTL
TXT     @                 v=spf1 include:_spf.resend.com ~all            3600
TXT     resend._domainkey k=rsa; p=MIGfMA0... (provided by Resend)      3600
TXT     _dmarc            v=DMARC1; p=quarantine; rua=mailto:dmarc@...  3600
```

**Verification:**
- `dig TXT oakfantasy.ro` → verifică SPF
- `dig TXT resend._domainkey.oakfantasy.ro` → verifică DKIM
- Tools: mxtoolbox.com pentru validare completă

### 5.3 SSL/TLS

- [ ] Vercel auto-provisions SSL via Let's Encrypt
- [ ] HTTPS-only enforced (no HTTP redirect)
- [ ] HSTS header configured cu `max-age` minim 1 an
- [ ] Certificate transparency monitoring (optional, prin Cert Spotter)

---

## 6. Rate Limiting & Anti-Abuse

### 6.1 Endpoints care necesită rate limiting

```
/api/contact            → max 5 requests/oră/IP (anti-spam form)
/api/subscribe          → max 3 requests/oră/IP (anti-spam newsletter)
/api/auth/login         → max 10 requests/oră/IP (anti-brute-force)
/api/auth/register      → max 5 requests/oră/IP
/api/auth/forgot-password → max 3 requests/oră/IP/email
/api/checkout/session   → max 20 requests/oră/IP
/api/admin/*            → necesită auth, plus rate limit per user
```

### 6.2 Implementare

Recomandare: **Upstash Redis** (gratuit până la 10K commands/zi)

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const contactRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'),
})
```

### 6.3 CAPTCHA pentru endpoints public

- **Contact form:** honeypot field (invizibil, dacă e completat = bot) +
  timing check (min 2s elapsed between mount și submit — vezi
  `lib/schemas/contact.ts` `elapsedMs`)
- **Auth pages:** Cloudflare Turnstile (gratuit) sau hCaptcha
- **Newsletter signup:** honeypot

### 6.4 Honest threat model — current state (added 2026-06-16)

**STATUS ACTUAL `/api/contact`:** rate limit este `lib/rate-limit.ts`
in-process `Map<string, RateLimitEntry>`. **Pe Vercel serverless asta NU
oferă defense reală cross-invocation** — fiecare cold start primește
proces nou, bucket-ul reset. Doar un atacator care nimerește același
warm instance e blocat.

Ce avem efectiv real azi (apel `/api/contact`):
- ✅ Honeypot field `website` (capturează majoritatea bot-urilor naive)
- ✅ Timing check min 2 secunde de la page mount la submit
- ⚠️ Memory rate-limit (eficacitate near-zero pe Vercel serverless)
- ❌ Persistent rate-limit cross-IP/global
- ❌ CAPTCHA Turnstile / hCaptcha
- ❌ Bot detection avansat (User-Agent heuristics, etc.)

**Pre-launch BLOCKER (nu nice-to-have):**
- [ ] **Upstash Redis sliding-window rate-limit** pe `/api/contact`
      (5/h/IP) + `/api/subscribe` (3/h/IP) + `/api/auth/*`. Înlocuiește
      complet `lib/rate-limit.ts`. Estimat 30 min effort.
- [ ] **Cloudflare Turnstile** pe contact form ca defense layer 3.
      Estimat 45 min effort + 5 min DNS.
- [ ] Update `lib/rate-limit.ts` cu deprecation banner sau șterge după
      migrare.

### 6.5 Email throttling (added 2026-06-16)

Contact form trimite 2 emailuri/submit prin Resend (admin notification +
auto-reply). Free plan Resend = 3000 emailuri/lună. Calcul: dacă rate
limit Upstash blochează la 5 req/h/IP global → max ~720 submits/zi (în
practică sub 10/zi pre-launch).

- [ ] Setup Resend monthly usage alert la 80% (2400/luna) → email
      tvarvaroi@gmail.com
- [ ] Dacă launch crește volumul, upgrade la Resend Pro ($20/lună,
      50K emailuri)

---

## 7. Stripe Security Pre-Launch

### 7.1 Switch test → live mode

- [ ] Stripe account business verified (KYC complete)
- [ ] Live API keys generate
- [ ] Webhook endpoint live mode configurat
- [ ] Webhook signing secret rotated în Vercel
- [ ] Test cu un cont bancar real prima oară (ex: 1 RON refunded)

### 7.2 PCI Compliance

- [ ] **NU stoca date carduri în Supabase!** Toate datele card stau la Stripe
- [ ] Folosește Stripe Elements / Payment Element (nu rebuild custom form)
- [ ] Audit: confirmă în code că `card_number`, `cvc`, `expiry` NU apar nicăieri

### 7.3 Fraud protection

- [ ] Stripe Radar activat (default ON)
- [ ] Configurează rules: block payments din țări high-risk (dacă vinzi doar în RO)
- [ ] 3D Secure obligatoriu pentru tranzacții > 100 RON (SCA EU compliance)

---

## 8. Database Security Pre-Launch

### 8.1 Supabase RLS audit

Pentru fiecare tabel, verifică:

```sql
-- profiles
SELECT * FROM profiles WHERE id = auth.uid()  -- OK: user vede doar propriul profil
SELECT * FROM profiles  -- DENY: anonymous nu vede nimic

-- products  
SELECT * FROM products WHERE status = 'active'  -- OK: oricine vede produsele active
INSERT INTO products  -- DENY pentru non-admin

-- orders
SELECT * FROM orders WHERE user_id = auth.uid()  -- OK: user vede comenzile lui
INSERT INTO orders  -- OK pentru user autentificat, cu validare
UPDATE orders  -- DENY pentru users, admin only

-- email_subscribers
INSERT INTO email_subscribers  -- OK pentru anonymous (signup)
SELECT * FROM email_subscribers  -- DENY pentru anonymous
```

### 8.1.b RLS policies BUILT + AUDITED (status 2026-06-18, Task 2.1)

Toate policies există din migrațiile 2026-05-22 (090010) + sunt applied pe
remote. Smoke-tested la Task 2.1 (scripts/smoke-auth.mjs):

- [x] **profiles** — "Users read own" + "Users update own" + "Admin full".
      🔒 `guard_profile_role()` trigger blochează self-promotion la admin
      pentru useri autentificați (P0001 exception); exempt când
      `auth.uid() IS NULL` (SQL editor / service-role) ca primul admin să
      poată fi setat manual. VERIFIED: self-promotion blocked.
- [x] **orders** — "Users read own" (profile_id=auth.uid()) + "Admin full".
      Inserts DOAR via service-role (guest orders prin API). No anon INSERT.
- [x] **order_items / order_status_history** — owner reads via parent order
      join + admin full.
- [x] **addresses** — owner CRUD (profile_id=auth.uid()) + admin full.
- [x] **products** — public reads active (anon+auth) + admin full.
- [x] **inventory / stock_movements** — admin only. Mutații via
      reserve/release/fulfill_stock (SECURITY DEFINER, audit în stock_movements).
- [x] **email_subscribers** — anon INSERT (canonical, Task 1.1) + admin reads.
- [x] **is_admin()** SECURITY DEFINER — evită recursion pe profiles policy.
- [x] **handle_new_user** trigger — profile auto-created la signup
      (role=customer default). VERIFIED.

Re-audit pre-launch: rulează `scripts/smoke-auth.mjs` pe proiectul prod nou
(§8.5) după ce-l creezi.

### 8.1.c HAND-OFF founder — Supabase Auth settings (Task 2.1)

- [ ] Dashboard → Auth → Providers → Email → **"Confirm email" OFF**
      (founder decision: signup fără email verification). Nu e în cod
      (no supabase/config.toml local; settings în dashboard).
- [ ] DUPĂ ce founder face signup (Task 2.2): promovare admin via SQL editor:
      `UPDATE profiles SET role='admin' WHERE email='tvarvaroi@gmail.com';`
      (guard_profile_role exempt când auth.uid() IS NULL în SQL editor)
- [ ] Google OAuth provider — configurat la Task 2.3 (Google Cloud Console nou)

### 8.2 Backup strategy

- [ ] Supabase auto-backup activ (daily snapshots, retenție 7 zile pe Free plan)
- [ ] Backup manual înainte de fiecare migration majoră
- [ ] Test restore procedure (1 dată, în staging)
- [ ] Pentru production: upgrade la Pro plan ($25/lună) pentru:
  - Point-in-time recovery
  - 7 zile → 28 zile backup retention
  - Better RPO/RTO

### 8.3 Migrations review

- [ ] Toate migrațiile în `supabase/migrations/` reviewed
- [ ] Nicio migrație nu drop tables în production fără backup
- [ ] Test all migrations pe staging înainte de prod
- [ ] Versioning corect (timestamp prefix)

### 8.4 Supabase plan decision (added 2026-06-15 după Sprint 1)

- [ ] Decide: Free Plan + restore on-demand vs Pro Plan ($25/lună)
      pentru no-pause guarantee
- [ ] Dacă rămânem Free: implementează cron ping (Vercel Cron sau
      GitHub Action) la fiecare 6 zile pe `juuozsjvuikdtjqhdylw` (sau
      proiect prod nou) ca să prevenim auto-pause
- [ ] Dacă upgrade Pro: validate point-in-time recovery + 28-day
      retention configurate corect; review billing alert threshold
- [ ] Document choice în `_brain/notes/decisions.md` cu motivaţia

### 8.5 Create prod project (added 2026-06-15)

Singurul proiect Supabase real azi e `juuozsjvuikdtjqhdylw` care e
folosit ca dev/staging. Vezi gotcha "Single Supabase project, not
staging+prod" în `_brain/notes/gotchas.md`.

- [ ] Create new Supabase project "oakfantasy-prod" în regiune Frankfurt
- [ ] Apply TOATE migrations din `supabase/migrations/` (clean state,
      fără debug migrations propagate)
- [ ] Re-seed produse iniţiale din `supabase/seeds/01_products.sql`
- [ ] Update Vercel env vars (Production) cu URL + keys prod project
- [ ] Test E2E (WaitlistSection, /contact form, eventual checkout)
      pe URL Vercel prod ÎNAINTE de a conecta domain `oakfantasy.ro`
- [ ] Manual verify RLS policies pe prod match canonical state:
      ```sql
      SELECT policyname, roles, cmd, with_check
      FROM pg_policies WHERE schemaname='public';
      ```
      Expected pe `email_subscribers`: o singură policy
      "Anyone can subscribe" INSERT anon+authenticated WITH CHECK
      email format

### 8.6 RLS smoke test per tabel pre-launch (added 2026-06-15)

Pentru fiecare tabel public RLS-enabled, smoke test ca rol `anon`
înainte de launch ca să confirmăm policies aplică corect:

- [ ] `email_subscribers` — INSERT policy verified (canonical restored
      2026-06-16, vezi migration `20260616120000_*`)
- [ ] `products` — SELECT WHERE status='active' permis pentru anon;
      INSERT denied pentru anon
- [ ] `profiles` — own user only (după Sprint 2 Auth) — pending
- [ ] `orders` — own user + admin only (după Sprint 3 Checkout) — pending
- [ ] `order_items` — same as orders — pending
- [ ] `inventory` — anon SELECT denied; service_role only — pending
- [ ] `stock_movements` — admin only — pending
- [ ] `order_status_history` — own order user + admin — pending

Smoke test pattern pentru INSERT-only tables (`email_subscribers`):
**NU folosi `.insert().select()`** — chained `.select()` cere SELECT
policy şi va returna 42501 misleading. Foloseşte:
```js
const { error } = await supabase.from('TABLE').insert(entry);
```
Vezi `scripts/smoke-canonical.mjs` ca referinţă. Gotcha complet în
`_brain/notes/gotchas.md` `.insert().select() cu RLS — 42501 e misleading`.

---

## 9. Monitoring & Alerting Setup

### 9.1 Sentry (error tracking)

- [ ] Create Sentry project pentru oak-fantasy
- [ ] Add SDK în Next.js (`@sentry/nextjs`)
- [ ] Configure DSN în env vars
- [ ] Test: trigger un error → verifică în Sentry dashboard
- [ ] Setup alerts: email/Slack când new error type apare

### 9.2 Vercel Analytics & Speed Insights

- [x] Speed Insights activ (configured în Sprint pre-acestui document)
- [ ] Vercel Analytics activ (pageviews + basic metrics)
- [ ] Custom alerts pentru: deploy failed, response time > 3s

### 9.3 Uptime monitoring

- [ ] Setup external monitor (ex: BetterUptime, UptimeRobot — free tiers)
- [ ] Check `/` la 5 minute interval
- [ ] Check `/api/health` (endpoint custom care testează DB connection)
- [ ] Alert email + SMS la downtime

### 9.4 Logs

- [ ] Vercel logs retention review (Hobby = 1 zi, Pro = 30 zile)
- [ ] Loguri sensibile (auth, payments) → log separat în Supabase tabela `audit_logs`
- [ ] Nu logueza: parole, tokens, card data

---

## 10. GDPR & Legal Compliance

### 10.1 Cookie consent banner

- [ ] Implementează banner cu opt-in pentru Analytics + Marketing cookies
- [ ] Speed Insights = "necessary" (poate funcționa fără consent, dar de discutat cu juristul)
- [ ] User poate revoca consent oricând
- [ ] Cookie policy linkată în banner

### 10.1.b Cookie policy page (deferred post-Sprint 1)

Status azi: site-ul NU setează cookies non-essential. Doar
preferințele de locale și (eventual post-Sprint 2) sesiunea de auth.
Atât. Deci pagină dedicată `/cookie-policy` ar fi prematur acum.

- [ ] Adaugă `cookie` la PATHNAMES + skeleton page când:
  - Vercel Analytics / Google Analytics / Plausible activat (orice
    analytics non-essential)
  - Banner Cookie Consent intră în UI
  - Sub-procesatori cu cookies third-party (Stripe checkout iframe etc.)
- [ ] Întâi banner consent + analytics, APOI pagină — invers degeaba
- [ ] Foloseşte aceeași `LegalLayout` infrastructure ca termeni/privacy/retur

### 10.2 Data Processing Agreement (DPA)

Verifică că ai DPA semnat (sau ai acceptat ToS-uri care includ DPA) cu:

- [ ] Vercel (hosting)
- [ ] Supabase (database + auth)
- [ ] Stripe (payments)
- [ ] Resend (email)
- [ ] Google Cloud (OAuth + Maps eventual)

### 10.3 Right to access / deletion endpoints

- [ ] `/api/user/data-export` — descarcă toate datele user-ului (GDPR Article 15)
- [ ] `/api/user/delete-account` — șterge cont + anonymizează comenzi (GDPR Article 17)
- [ ] Test ambele endpoint-uri pre-launch

### 10.4 ANPC requirements

- [ ] Link ANPC pe footer / pagini legale
- [ ] Logo "SAL" și "SOL" (Soluționare Alternativă a Litigiilor / Soluționare Online) — link European Commission ODR platform
- [ ] Politică retur conform OUG 34/2014

---

## 11. Performance & Lighthouse Audit Pre-Launch

### 11.1 Lighthouse score target

- [ ] Performance > 85 (mobile + desktop)
- [ ] Accessibility > 95
- [ ] Best Practices > 90
- [ ] SEO > 95

### 11.2 Web Vitals target (din Speed Insights)

- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms

### 11.3 Bundle size audit

- [ ] First Load JS < 150 KB per route (mobile-friendly)
- [ ] Run `npm run build` și verifică `.next/analyze/`
- [ ] Identifică top 5 cele mai mari dependencies, optimizează

---

## 12. Final Pre-Launch Checklist (1 zi înainte)

### 12.1 Toate task-urile de mai sus DONE ✅

### 12.2 Test final user journey

Tester (prieten/family) face flow complet:
- [ ] Vizitează homepage de pe mobile + desktop
- [ ] Browse /tocatoare
- [ ] Click pe un produs → product detail
- [ ] Add to cart
- [ ] Checkout cu Stripe test card (4242 4242 4242 4242)
- [ ] Primește email confirmation
- [ ] Admin vede comanda în /admin/comenzi

### 12.3 Smoke test toate paginile

- [ ] /ro și /en toate paginile load OK
- [ ] No 404s, no broken images
- [ ] Footer arată legal info real (nu placeholder)
- [ ] Email contact funcționează (trimite test la info@oakfantasy.ro)

### 12.4 Rollback plan

- [ ] Backup DB exportat și salvat local
- [ ] Lista comenzi/clienți la momentul launch (pentru audit)
- [ ] Procedură rollback documentată: dacă apare bug critic în prima zi, cum dezactivăm site-ul (Vercel pause project) și comunică la clienți

---

## 13. Post-Launch (Primele 7 zile)

### 13.1 Monitoring intensiv

- [ ] Check Sentry zilnic pentru noi errors
- [ ] Check Stripe pentru tranzacții (orice eroare → investigare imediată)
- [ ] Check Vercel logs pentru anomalii
- [ ] Check email deliverability pe Resend dashboard

### 13.2 First customer support

- [ ] Răspunde la /contact form messages în < 24h
- [ ] Fii pregătit pentru întrebări tehnice de la cumpărători
- [ ] Documentează FAQ în `/help` page (post-launch)

### 13.3 Key rotation cycle

După primii 30 zile (când totul e stabil), începe rotația periodică:
- [ ] Resend API key — la 90 zile
- [ ] Stripe webhook secret — la 180 zile (sau imediat dacă suspectezi compromis)
- [ ] Supabase service role — la 180 zile

---

## 14. Jurnal Rotații — Tracking cronologic key rotations

Format: `data | service | eveniment | key prefix (sau [TBD])`

```
2026-06-15 | resend | INITIAL key created (development purposes)        | re_GnEqPV...

2026-06-15 | resend | INCIDENT — exposed in strategic chat with Claude  | re_GnEqPV...
           |        | Document Section 1.1 redacted, repo safe
           |        | DECISION: keep live, NU rotate acum
           |        | Reasoning: site not live, zero traffic, no real risk
           |        |   Pre-launch rotation already planned (Sprint 4 final)
           |        |   Avoid duplicate work — would rotate again pre-launch
           |        | Mitigation: redacted in repo, exists only in Vercel env vars

[pre-launch] | resend | ROTATION 1 — replace with oak-fantasy-production | [TBD]
```

**Protocol pentru entry nou:**
- La fiecare rotație/creare/revocare cheie → entry nou cu data ISO + service + acțiune + key prefix
- Decizii conștiente (defer, accept risk, etc.) → multi-line entry cu reasoning + mitigation
- Pre-launch placeholder `[pre-launch]` pentru rotații planificate la Sprint 4 final
- Acest jurnal e source-of-truth pentru audit security post-launch

---

## Anexă A: Comenzi utile pentru audit

```bash
# Audit secrete în repo
git secrets --scan  # (instalat: brew install git-secrets)

# Verifică env vars folosite
grep -rn "process.env\." app/ lib/ --include="*.ts" --include="*.tsx" | \
  grep -oE "process\.env\.[A-Z_]+" | sort -u

# Verifică placeholder-uri rămase
grep -rn "\[.*\]" app/ components/ --include="*.tsx" | grep -E "\[[A-Z_]+\]"

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=https://oakfantasy.ro

# Dependency audit
npm audit --production
npm outdated
```

---

## Anexă B: Contacts & Vendor Info

| Service | Account email | Dashboard URL | Suport |
|---------|---------------|---------------|--------|
| Vercel | tvarvaroi@gmail.com | vercel.com | vercel.com/help |
| Supabase | (TBD) | supabase.com | supabase.com/dashboard/support |
| Stripe | (TBD setup la Sprint 3) | dashboard.stripe.com | support@stripe.com |
| Resend | tvarvaroi@gmail.com | resend.com | resend.com/contact |
| SmartBill | (TBD setup la Sprint 4) | smartbill.ro | suport@smartbill.ro |
| ROTLD (domain) | (TBD) | rotld.ro | suport@rotld.ro |

---

**Document END.** Update după fiecare sprint cu task-uri noi descoperite.
