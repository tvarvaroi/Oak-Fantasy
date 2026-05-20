# Next.js App Router — SEO / Metadata
> Source: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
> Fetched: 2026-05-16
> Use for: meta tags, OG, canonical, sitemap, robots pe paginile noi Oak Fantasy

## Esențial

- `metadata` API doar în **Server Components** (proiectul are `[locale]/layout.tsx` server — OK; `[locale]/page.tsx` e `'use client'` → metadata se pune pe layout sau pe page.tsx server al fiecărei rute noi).
- **Static**: `export const metadata: Metadata = { title, description }`.
- **Dinamic**: `export async function generateMetadata({ params }): Promise<Metadata>` — exact pattern-ul deja folosit în `app/[locale]/layout.tsx`.
- Memoizează fetch comun metadata+pagină cu React `cache()`.

## Câmpuri relevante

```ts
export const metadata: Metadata = {
  title: '...', description: '...',
  alternates: {
    canonical: 'https://oakfantasy.ro/ro/despre',
    languages: { 'ro': '/ro/despre', 'en': '/en/about' }, // hreflang
  },
  openGraph: { title, description, images: [{ url: '/og.jpg' }], locale: 'ro_RO' },
  twitter: { card: 'summary_large_image', title, description },
}
```

## File-based metadata (root `app/`)

- `favicon.ico`, `icon.png`, `apple-icon.png`
- `opengraph-image.tsx` / `.jpg` (per rută; cel mai specific câștigă). Dinamic via `ImageResponse` din `next/og` (size 1200×630).
- `app/sitemap.ts` → exportă funcție ce întoarce array de `{ url, lastModified, alternates }` (sitemap.xml auto).
- `app/robots.ts` → reguli + referință sitemap (robots.txt auto).

## Pentru Oak Fantasy

- Extinde pattern-ul `generateMetadata` existent pe fiecare rută nouă din `app/[locale]/<ruta>/`.
- `alternates.languages` obligatoriu pentru hreflang RO/EN.
- Creează `app/sitemap.ts` + `app/robots.ts` (Etapa 1 SEO).
