import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Caudex, Caveat, Lora } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import PageTransition from '@/components/PageTransition';
import { isLocale, type Locale } from '@/lib/i18n-routes';
import { LEGAL_INFO, hasPlaceholder } from '@/lib/legal-info';
import '../globals.css';

const caudex = Caudex({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-caudex',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-caveat',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-lora',
  display: 'swap',
});

const SITE_URL = 'https://oakfantasy.ro';

// Sitewide entity graph (SEO audit fix #4). Organization + WebSite with stable
// @id anchors — subpages (despre/atelier/contact/termeni) reference these ids
// instead of re-declaring disconnected copies. sameAs = REAL social profiles
// (live 2026-07-11). Address = registered HQ (public registry data, Arad);
// the WORKSHOP address is permanently unlisted (founder decision) — never emit.
function entityGraph(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Oak Fantasy',
        url: SITE_URL,
        logo: `${SITE_URL}/3D_Cutting_Board_Model_Design.svg`,
        description:
          locale === 'en'
            ? 'A small Romanian workshop hand-crafting oak cutting boards from Carpathian oak.'
            : 'Atelier românesc mic care lucrează manual tocătoare din stejar din Carpați.',
        foundingDate: '2026',
        email: LEGAL_INFO.contactEmail,
        // Placeholder-aware (audit fix #11): fields join the schema
        // automatically once env values land — never emit a "[TOKEN]".
        ...(hasPlaceholder(LEGAL_INFO.contactPhone)
          ? {}
          : { telephone: LEGAL_INFO.contactPhone.replace(/\s+/g, '') }),
        sameAs: [
          LEGAL_INFO.social.instagram,
          LEGAL_INFO.social.facebook,
          LEGAL_INFO.social.tiktok,
        ],
        address: {
          '@type': 'PostalAddress',
          ...(hasPlaceholder(LEGAL_INFO.hqAddress)
            ? {}
            : { streetAddress: LEGAL_INFO.hqAddress, addressLocality: 'Arad' }),
          addressCountry: 'RO',
          addressRegion: 'Arad',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Oak Fantasy',
        inLanguage: ['ro', 'en'],
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };
}

// Escape `<` so embedded JSON-LD can't break out of <script>.
function ldSafe(json: unknown): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale: Locale = params.locale;

  // Homepage canonical + hreflang (SEO audit fix #4) — every inner page already
  // declares these; the homepage was the only URL without them.
  const shared = {
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/${locale}`,
      languages: { ro: '/ro', en: '/en', 'x-default': '/ro' },
    },
  };

  if (locale === 'en') {
    return {
      ...shared,
      title: 'Oak Fantasy — Romanian Oak Cutting Boards',
      description: 'Handcrafted cutting boards from Carpathian oak. Made with love in Romania.',
      openGraph: {
        title: 'Oak Fantasy — Romanian Oak Cutting Boards',
        description: 'From Romanian oak, cut and finished one by one in our workshop.',
        images: [{ url: '/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg' }],
      },
    };
  }
  return {
    ...shared,
    title: 'Oak Fantasy — Tocătoare din stejar românesc',
    description: 'Tocătoare lucrate manual din stejar din Carpați. Făcut cu drag în România.',
    openGraph: {
      title: 'Oak Fantasy — Tocătoare din stejar românesc',
      description: 'Din lemn de stejar românesc, tăiat și finisat unul câte unul în atelierul nostru.',
      images: [{ url: '/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg' }],
    },
  };
}

export async function generateStaticParams() {
  return [{ locale: 'ro' }, { locale: 'en' }];
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // SEO audit fix #1: without this guard, ANY dotted path skipped by the
  // middleware matcher (/robots.txt, /.env, /x.jpg, /wp-login.php) fell through
  // to this dynamic segment with locale="robots.txt" and soft-rendered the
  // homepage as HTTP 200 — infinite duplicate-content surface. Real 404 now.
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  return (
    <html
      lang={locale}
      className={`${caudex.variable} ${caveat.variable} ${lora.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldSafe(entityGraph(locale)) }}
        />
        <PageTransition>{children}</PageTransition>
        {/* SpeedInsights MUST live inside <body>. v2.0.0 wraps its component in
            a <Suspense> boundary (it calls useSearchParams); a Suspense boundary
            rendered as a sibling of <html> (the old root-layout placement) can't
            be hydrated → global #document hydration mismatch (React #418/#423) on
            every page. Its useEffect injector dedupes by script src, so the
            locale-switch remount never double-loads. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
