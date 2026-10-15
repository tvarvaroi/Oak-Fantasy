# Plata cu cardul (Stripe) — DORMANT din 2026-10-15

> Decizie founder: lansăm doar cu **ramburs la livrare** (numerar la curier).
> Stripe NU e șters. Tot codul, pachetul `stripe` și migrațiile rămân în repo,
> oprite printr-un singur flag. Reactivarea = configurare, zero cod.

## Flag-ul

`lib/config/payments.ts` → `CARD_PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CARD_PAYMENTS === 'true'`
(default **false**). `DEFAULT_PAYMENT_METHOD = 'cod'`.

## Ce face flag-ul oprit (starea curentă)

| Loc | Comportament cu flag OFF |
|---|---|
| `components/checkout/CheckoutContent.tsx` | 2 pași: Livrare → Rezumat. `PaymentStep` nu e montat. |
| `components/checkout/ReviewStep.tsx` | Panou „Ramburs la livrare" + termen de livrare în locul etichetei metodei. |
| `lib/orders/place-order.ts` | `paymentMethod` forțat pe `cod` server-side; ramura Stripe e inaccesibilă. |
| `app/api/webhooks/stripe/route.ts` | Răspunde `410 Card payments disabled` înainte de orice. |
| `lib/orders/status.ts` | `ADMIN_ORDER_STATUSES` exclude `pending_payment` (dropdown + pills). Enum-ul complet rămâne (oglindă CHECK DB). |
| `lib/stripe/server.ts` | Neatins. `getStripe()` e lazy, nu aruncă la build fără cheie. |
| Emailuri, RPC `create_order`, `markOrderPaid` | Neatinse. Ramburs = rezervare stoc la plasare, emailuri la plasare, încasare marcată manual în admin. |

## Fluxul ramburs (activ)

```
checkout (Livrare → Rezumat) → placeOrder → create_order RPC
  (order status=pending_cod, payment_status=pending, reserve_stock STRICT, history)
  → emailuri client + admin → /multumim
admin: pending_cod „Nouă, de confirmat" → confirmed (founder verifică gravarea)
  → in_production → packed → shipped (fulfill_stock) → delivered
  „Marchează plătit" când curierul remite banii (payment_status=paid, audit în history)
  cancel din orice stare pre-expediere → release_stock
```

Badge „comenzi de confirmat": `countOrdersToConfirm()` în `lib/admin/orders.ts`,
afișat lângă „Comenzi" în sidebar (`AdminShell` → `AdminSidebar`) și ca StatCard pe
dashboard.

## Reactivare card (checklist)

1. Stripe Dashboard: cont business verificat (KYC), chei LIVE.
2. Vercel → Environment Variables (Production + Preview):
   - `NEXT_PUBLIC_ENABLE_CARD_PAYMENTS=true`
   - `STRIPE_SECRET_KEY=sk_live_…`
   - `STRIPE_WEBHOOK_SECRET=whsec_…` (pasul 3)
3. Stripe Dashboard → Developers → Webhooks → endpoint
   `https://<domeniu>/api/webhooks/stripe` cu evenimentele
   `checkout.session.completed` și `checkout.session.expired`; copiază signing secret-ul.
4. Redeploy. Checkout revine la 3 pași cu radio Card / Ramburs; `pending_payment`
   reapare în admin; webhook-ul procesează din nou.
5. Smoke: comandă test cu cardul `4242 4242 4242 4242` (chei de test întâi), verifică
   `confirmed` + `paid` + emailuri; apoi `expired` → `cancelled` + release.
6. Termeni: scoate propoziția „Momentan nu acceptăm plata online cu cardul" din
   `TERMS_FINAL_FACTS.payment` (`app/[locale]/termeni/page.tsx`).
7. `SECURITY_CHECKLIST.md` §1.4, §1.5, §7 redevin active.

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` nu a fost niciodată folosită în cod (Checkout
hosted = redirect, fără Stripe.js pe site) — nu e nevoie de ea nici la reactivare.

## Env de șters de pe Vercel (opțional, nu blochează nimic)

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
Dacă rămân, nu fac rău: nimic nu le citește cât timp flag-ul e oprit (webhook-ul
răspunde 410 înainte să citească secretul).
