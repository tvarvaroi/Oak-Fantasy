# Schema.org Article — JSON-LD
> Source: https://schema.org/Article
> Fetched: 2026-05-16
> Use for: JSON-LD pe `/blog/[slug]` (cele 8-12 articole SEO din seo-strategy)

Proprietăți: `headline`, `image`, `author` (Person), `publisher` (Organization + `logo` ImageObject), `datePublished`, `dateModified`, `description`, `articleBody`, `keywords`, `mainEntityOfPage`.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cum alegi un tocător de lemn — ghid complet",
  "image": "https://oakfantasy.ro/blog/cum-alegi-tocator.jpg",
  "author": { "@type": "Person", "name": "Oak Fantasy" },
  "publisher": {
    "@type": "Organization",
    "name": "Oak Fantasy",
    "logo": { "@type": "ImageObject", "url": "https://oakfantasy.ro/logo.png" }
  },
  "datePublished": "2026-05-16",
  "dateModified": "2026-05-16",
  "description": "Ghid complet pentru a alege tocătorul potrivit.",
  "mainEntityOfPage": "https://oakfantasy.ro/ro/blog/cum-alegi-tocator",
  "keywords": "tocător lemn, stejar, end grain"
}
```

Combină cu `BreadcrumbList` pe paginile interne și `FAQPage` pe articole/`/ingrijire` cu FAQ.
