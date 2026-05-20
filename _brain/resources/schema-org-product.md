# Schema.org Product — JSON-LD
> Source: https://schema.org/Product
> Fetched: 2026-05-16
> Use for: JSON-LD pe `/tocatoare/[slug]` (cele 10 SKU din CLAUDE.md §8)

Proprietăți cheie: `name`, `image`, `description`, `brand`, `sku`, `offers` (→ `Offer`: `price`, `priceCurrency`, `availability`, `url`), opțional `aggregateRating`/`review`.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Bloc Heirloom — tocător end-grain stejar",
  "description": "Tocător end-grain lucrat manual din stejar românesc, 50×40×8 cm.",
  "image": "https://oakfantasy.ro/produse/bloc-heirloom.jpg",
  "brand": { "@type": "Brand", "name": "Oak Fantasy" },
  "sku": "OF-09-HEIRLOOM",
  "offers": {
    "@type": "Offer",
    "price": "1500.00",
    "priceCurrency": "RON",
    "availability": "https://schema.org/InStock",
    "url": "https://oakfantasy.ro/ro/tocatoare/bloc-heirloom"
  }
}
```

Note: injectează cu `<script type="application/ld+json">` (sau `<Script>` Next). `availability` = `InStock`/`PreOrder` în funcție de stoc. Etapa 1: fără cumpărare → `Offer.url` duce la pagina produs, nu checkout.
