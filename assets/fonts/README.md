# Brand fonts (self-hosted)

Loaded by `lib/fonts.ts` with `next/font/local`. The build does not download
anything from Google.

| File | Family | Weight |
|------|--------|--------|
| caudex-400.woff2 / caudex-700.woff2 | Caudex | 400 / 700 |
| caveat-400.woff2 / caveat-600.woff2 | Caveat | 400 / 600 |
| lora-400.woff2 / lora-500.woff2 | Lora | 400 / 500 |

Licence: SIL Open Font License 1.1 — see `OFL-caudex.txt`, `OFL-caveat.txt`,
`OFL-lora.txt` (copied from github.com/google/fonts).

## How they were made (2026-11-19)

1. Full TTFs from the Google Fonts CSS API (no User-Agent → full `.ttf`):
   `https://fonts.googleapis.com/css2?family=Lora:wght@400;500` (same for
   `Caudex:wght@400;700`, `Caveat:wght@400;600`).
2. Subset with fontTools (keeps every OpenType layout feature):

   ```bash
   U="U+0020-007E,U+00A0-00FF,U+0100-017F,U+0218-021B,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2260,U+2264,U+2265"
   python -m fontTools.subset lora-400.ttf --unicodes="$U" --layout-features='*' --flavor=woff2 --output-file=lora-400.woff2
   ```

Covers Romanian (ă â î ș ț, plus legacy ş ţ), Latin-1 accents and the
typographic punctuation the copy uses. Lora and Caveat have no arrow glyphs
(neither did the Google-hosted files); arrows fall back to the system font.
