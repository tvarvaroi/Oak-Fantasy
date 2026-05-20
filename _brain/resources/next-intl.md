# next-intl — App Router (referință)
> Source: https://next-intl.dev/docs/getting-started/app-router (redirect din next-intl-docs.vercel.app)
> Fetched: 2026-05-16
> Use for: referință i18n — proiectul folosește momentan i18n CUSTOM, nu next-intl

## next-intl pe scurt

- 3 fișiere: `messages/<locale>.json`, `i18n/request.ts`, plugin în `next.config`.
- Root layout → `NextIntlClientProvider`.
- Acces: `useTranslations()` (client) / `getTranslations()` (server async).
- Routing: cu segment `[locale]` (pathname unic per limbă) SAU fără (locale din cookie/logică).

## Decizie Oak Fantasy

Proiectul folosește **i18n custom** prin `middleware.ts` + `app/[locale]/` + prop `language` (vezi `_brain/notes/decisions.md`). next-intl NU e instalat. Reține ca opțiune dacă numărul de texte traduse explodează (atunci messages JSON + `useTranslations` ar fi mai curat decât texte inline comutate pe `language`). Migrarea ar însemna: pachet nou (cere confirmare), `messages/ro.json`+`en.json`, refactor componente. Momentan: NU migra — pattern-ul inline funcționează pentru un site mic.
