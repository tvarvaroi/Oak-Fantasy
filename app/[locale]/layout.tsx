import type { Metadata } from 'next';
import { Caudex, Caveat, Lora } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import PageTransition from '@/components/PageTransition';
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

type Locale = 'ro' | 'en';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const { locale } = params;
  if (locale === 'en') {
    return {
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
  params: { locale: Locale };
}) {
  return (
    <html
      lang={params.locale}
      className={`${caudex.variable} ${caveat.variable} ${lora.variable}`}
    >
      <body>
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
