# Oak Fantasy — Brand Context & Design System

## Brand Positioning

**Brand:** Oak Fantasy  
**Origin:** Romanian artisan workshop, Carpathian oak  
**Personality:** Warm, hand-made, countryside-heritage with modern polish.  
**Three brand adjectives:** WARM. MADE-BY-HAND. ROOTED.

**Primary tagline (RO):** "Făcut cu drag în România."  
**Secondary tagline (EN):** "From Carpathian oak, by hand."

**Language:** Bilingual — Romanian primary, English toggle. Default: Romanian.

---

## Design System

### Colors (CSS Variables)

```
--forest-deep: #2D3A1F
--forest-mid: #5A6B3C
--moss: #8FA068
--oak-warm: #8B5E3C
--oak-deep: #5C3A20
--copper: #B87333
--cream-warm: #F5EBD8
--paper-aged: #EDE0C5
--bark: #1F1810
--ink: #2A2218
--ink-soft: #5D4E3A
--highlight: #C9A66B
```

### Typography

- **Display (headlines):** Caudex, weights 400 & 700 (Google Fonts)
- **Handwritten (accents):** Caveat, weights 400 & 600 (Google Fonts) — use SPARINGLY
- **Body:** Lora, weights 400 & 500 (Google Fonts), 17-18px
- **Labels:** Caudex, uppercase, letter-spacing 0.18em
- NEVER use sans-serif, geometric, or corporate fonts

### Layout Principles

- Warmth over precision; asymmetric layouts welcome
- Generous padding: 100-140px vertical between sections (desktop)
- Subtle paper grain via SVG turbulence filter at 0.06-0.08 opacity
- Decorative SVG elements (leaves, twigs): one per section max
- Border-radius up to 12px on cards/buttons
- Thin 1-2px borders in oak-warm or forest-mid as dividers

---

## Animation Rules

- **Motion (motion/react):** component-level hover states, mount animations, scroll reveals
- **GSAP + ScrollTrigger:** navbar shrink, horizontal scroll, parallax, pinned sequences
- **Three.js + react-three-fiber:** hero 3D board
- **Easing:** `[0.16, 1, 0.3, 1]` for entrances; `[0.4, 0, 0.2, 1]` for state changes
- **Duration:** micro-interactions 200-300ms; reveals 600-900ms
- **Stagger:** 0.08s to 0.18s
- Always implement `useReducedMotion` from motion/react
- SVG decoratives: stroke-dashoffset draw-on animation on viewport entry
- Animate ONLY: transform (translate, scale, rotate) and opacity

---

## Copy Voice

- First person plural: "noi facem", "atelierul nostru"
- Warm but concrete: "stejar din Bucegi" not "lemn premium"
- Romanian diacritics: ă, â, î, ș, ț — never strip them
- No emojis anywhere
- Max one exclamation mark in the entire site
- Avoid: "premium", "exclusiv", "luxury", "rafinat"
- Use: "lucrat", "făcut", "atelier", "manual", "mâini", "stejar", "moștenire"

---

## Database

**Table: waitlist**
- `id` uuid PK
- `email` text unique not null
- `language` text ('ro' | 'en') default 'ro'
- `source` text ('hero' | 'waitlist') default 'hero'
- `created_at` timestamptz default now()

Success message (RO): "Mulțumim! Vom păstra legătura."

---

## Tech Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS (custom design system)
- Motion (motion/react) — formerly Framer Motion
- GSAP + ScrollTrigger
- Three.js + @react-three/fiber + @react-three/drei
- Supabase (database + auth)

---

## Logo

File: `/public/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg`  
Used in: Navbar (56px→44px on scroll), Footer (small)

---

## Site Sections (build order)

1. Sticky Navbar ✓
2. Hero Section ✓
3. Story Strip
4. Workshop Section
5. Product Tease (horizontal scroll)
6. Numbers Strip
7. Craft Video Tease
8. Waitlist Section
9. Footer
