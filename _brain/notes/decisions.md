# Architectural Decisions

> Decizii arhitecturale + motivul lor. Nu re-litigăm ce e aici fără motiv nou.
> Format: `## YYYY-MM-DD — decizie` + Context / Decizie / Motiv / Alternative respinse.

---

## 2026-05-16 — i18n custom prin middleware, nu next-intl

**Context:** Proiectul are nevoie de RO (default) + EN.
**Decizie:** Routing pe locale via `middleware.ts` + `app/[locale]/` + `generateStaticParams`. Limba se pasează ca prop `language: 'ro' | 'en'` în jos prin componente.
**Motiv:** Setup minim, zero dependențe noi, SSG-friendly. Moștenit din build-ul existent.
**Alternative respinse:** `next-intl` (overhead pentru un site mic cu texte inline).

## 2026-05-16 — Paletă brand prin CSS variables + Tailwind tokens

**Context:** Design system imutabil, consistență obligatorie pe tot site-ul.
**Decizie:** Culorile sunt CSS vars în `app/globals.css` (`--oak-warm` etc.) ȘI tokens Tailwind în `tailwind.config.ts`. Niciodată hex hardcodat în componente.
**Motiv:** O singură sursă de adevăr; orice pagină nouă rămâne consistentă cu landing-ul.
**Alternative respinse:** Hex direct în componente (duce la drift de brand).
