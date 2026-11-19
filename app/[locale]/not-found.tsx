import NotFoundView from '@/components/not-found/NotFoundView';

// 404 for every /ro/... and /en/... URL (2026-11-19): rendered inside the
// [locale] layout, so it gets the brand fonts, <html lang> and global CSS.
// Unknown paths reach it through app/[locale]/[...rest]/page.tsx; pages that
// call notFound() (e.g. an unknown product slug) land here directly.
export default function LocaleNotFound() {
  return <NotFoundView />;
}
