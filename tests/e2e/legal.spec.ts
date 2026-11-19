import { test, expect } from './fixtures';

// Legal pages — final texts (2026-11-19). Guards the things that must never
// regress on a public legal page: no "in preparation"/draft wording or
// [TOKEN] placeholders, merchant data rendered from LEGAL_INFO, every
// section reachable from the table of contents, the facts the founder fixed
// at the gate, and the links that lead to these pages.

const PAGES = [
  { path: '/ro/termeni', h1: 'Termeni și condiții', sections: 15, date: '20 noiembrie 2026' },
  { path: '/en/terms', h1: 'Terms and conditions', sections: 15, date: '20 November 2026' },
  { path: '/ro/confidentialitate', h1: 'Politica de confidențialitate', sections: 12, date: '20 noiembrie 2026' },
  { path: '/en/privacy', h1: 'Privacy policy', sections: 12, date: '20 November 2026' },
  { path: '/ro/retur', h1: 'Politica de retur', sections: 10, date: '20 noiembrie 2026' },
  { path: '/en/returns', h1: 'Returns policy', sections: 10, date: '20 November 2026' },
] as const;

test.describe('Legal pages — structure', () => {
  for (const p of PAGES) {
    test(`${p.path}: final text, date, merchant data, every section in the contents`, async ({ page, consoleErrors }) => {
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      const main = page.locator('main');

      await expect(page.locator('h1')).toHaveText(p.h1);
      await expect(main).toContainText(p.date);

      const text = await main.innerText();
      expect(text).not.toMatch(/în pregătire|in preparation|draft|schiță|avocat|lawyer/i);
      expect(text).not.toMatch(/\[[A-Z_]+\]/); // no [PLACEHOLDER] token
      expect(text).not.toMatch(/\{[a-zA-Z]+\}/); // no unresolved {token}
      expect(text).not.toMatch(/\bODR\b|\bSOL\b|Stripe/);

      // Merchant identity comes from LEGAL_INFO (company name with the final dot).
      await expect(main).toContainText('ROOBO PELLETS S.R.L.');
      await expect(main).toContainText('39549528');

      const sections = main.locator('section[id]');
      await expect(sections).toHaveCount(p.sections);
      const ids = await sections.evaluateAll((els) => els.map((e) => e.id));
      const tocTargets = await page
        .getByTestId('legal-toc')
        .locator('a')
        .evaluateAll((els) => els.map((e) => (e.getAttribute('href') ?? '').slice(1)));
      expect(tocTargets).toEqual(ids);

      // Server-rendered pages: no hydration exclusion here — a mismatch must fail.
      expect(consoleErrors.filter((e) => !e.startsWith('Warning:'))).toEqual([]);
    });
  }

  test('TOC opens and jumps to a section', async ({ page }) => {
    await page.goto('/ro/retur');
    const toc = page.getByTestId('legal-toc');
    await toc.locator('summary').click();
    await toc.getByRole('link', { name: /Rambursarea banilor/ }).click();
    await expect(page).toHaveURL(/#refund$/);
    await expect(page.locator('#refund')).toBeInViewport();
  });
});

test.describe('Legal pages — founder facts', () => {
  test('Terms RO: confirmation by phone/WhatsApp, cash on delivery, delivery terms, 18+', async ({ page }) => {
    await page.goto('/ro/termeni');
    const main = page.locator('main');
    await expect(main).toContainText('Contractul se încheie în momentul în care îți confirmăm comanda.');
    await expect(main).toContainText('prin telefon sau pe WhatsApp');
    await expect(main).toContainText('Plata se face exclusiv ramburs');
    await expect(main).toContainText('5–10 zile lucrătoare');
    await expect(main).toContainText('1–3 zile lucrătoare');
    await expect(main).toContainText('Transportul costă 25 RON');
    await expect(main).toContainText('de la 500 RON');
    await expect(main).toContainText('cel puțin 18 ani');
    await expect(main).toContainText('art. 16 lit. c');
    await expect(main).toContainText('Dacă refuzi coletul la livrare, anulăm comanda');
    await expect(main).toContainText('documentul fiscal aferent comenzii');
    await expect(main.getByRole('link', { name: 'ANPC' }).first()).toHaveAttribute('href', 'https://anpc.ro');
  });

  test('Privacy RO: real processors, retention periods, storage keys, ANSPDCP', async ({ page }) => {
    await page.goto('/ro/confidentialitate');
    const main = page.locator('main');
    for (const s of [
      'Supabase',
      'Vercel',
      'Resend',
      'WhatsApp (Meta)',
      'Firma de curierat care livrează comanda',
      'Prestatorul de servicii de contabilitate',
      'Frankfurt',
      '3 ani',
      '12 luni',
      '2 ani',
      'oak-cart',
      'auth-token',
      'ANSPDCP',
    ]) {
      await expect(main).toContainText(s);
    }
    await expect(main.getByRole('link', { name: 'www.dataprotection.ro' })).toHaveAttribute(
      'href',
      'https://www.dataprotection.ro',
    );
  });

  test('Returns RO: three rules, IBAN refund, address by email, withdrawal form annex', async ({ page }) => {
    await page.goto('/ro/retur');
    const main = page.locator('main');
    await expect(main).toContainText('Produse standard: 14 zile, fără motiv');
    await expect(main).toContainText('Produse gravate și lucrări la comandă: fără retur');
    await expect(main).toContainText('inclusiv la cele gravate');
    await expect(main).toContainText('Scriind IBAN-ul, ești de acord să primești banii astfel.');
    await expect(main).toContainText('îți trimitem pe email adresa la care trimiți coletul');
    const form = page.getByTestId('withdrawal-form');
    await expect(form).toBeVisible();
    await expect(form).toContainText('Formular de retragere');
    await expect(form).toContainText('ROOBO PELLETS S.R.L.');
    await expect(form).toContainText('IBAN');
    // In-page links resolve to real sections (the step list + the contents).
    await expect(main.locator('section a[href="#withdrawal-form"]')).toHaveCount(1);
    await expect(page.locator('#withdrawal-form')).toHaveCount(1);
  });

  test('Returns EN mirrors the RO rules', async ({ page }) => {
    await page.goto('/en/returns');
    const main = page.locator('main');
    await expect(main).toContainText('Standard products: 14 days, no reason needed');
    await expect(main).toContainText('By giving your IBAN, you agree to be refunded this way.');
    await expect(page.getByTestId('withdrawal-form')).toContainText('Withdrawal form');
  });
});

test.describe('Links to the legal pages', () => {
  test('Footer: terms, privacy, returns, ANPC and SAL — no ODR/SOL link', async ({ page }) => {
    await page.goto('/ro');
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'Termeni și condiții' })).toHaveAttribute('href', '/ro/termeni');
    await expect(footer.getByRole('link', { name: 'Confidențialitate' })).toHaveAttribute('href', '/ro/confidentialitate');
    await expect(footer.getByRole('link', { name: 'Retur', exact: true })).toHaveAttribute('href', '/ro/retur');
    await expect(footer.getByRole('link', { name: 'ANPC' })).toHaveAttribute('href', 'https://anpc.ro');
    await expect(footer.getByRole('link', { name: 'SAL' })).toHaveAttribute('href', 'https://anpc.ro/ce-este-sal/');
    await expect(footer.locator('a[href*="ec.europa.eu/consumers/odr"]')).toHaveCount(0);
    // "Cont" copy describes what the account really does.
    await expect(footer).toContainText('datele tale se completează singure la comandă');
    await expect(footer).not.toContainText('într-un singur loc');
  });

  test('Footer EN links', async ({ page }) => {
    await page.goto('/en');
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'Terms and Conditions' })).toHaveAttribute('href', '/en/terms');
    await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/en/privacy');
    await expect(footer.getByRole('link', { name: 'Returns' })).toHaveAttribute('href', '/en/returns');
    await expect(footer.locator('a[href*="ec.europa.eu/consumers/odr"]')).toHaveCount(0);
  });

  test('Contact form carries the privacy notice (RO + EN)', async ({ page }) => {
    await page.goto('/ro/contact');
    await expect(page.getByTestId('contact-privacy-note').getByRole('link')).toHaveAttribute('href', '/ro/confidentialitate');
    await page.goto('/en/contact');
    await expect(page.getByTestId('contact-privacy-note').getByRole('link')).toHaveAttribute('href', '/en/privacy');
  });

  test('Register form links the terms and the privacy policy (RO + EN)', async ({ page }) => {
    await page.goto('/ro/inregistrare');
    const ro = page.getByTestId('register-legal-note');
    await expect(ro.getByRole('link', { name: 'termenii și condițiile' })).toHaveAttribute('href', '/ro/termeni');
    await expect(ro.getByRole('link', { name: 'politica de confidențialitate' })).toHaveAttribute('href', '/ro/confidentialitate');
    await page.goto('/en/register');
    const en = page.getByTestId('register-legal-note');
    await expect(en.getByRole('link', { name: 'terms and conditions' })).toHaveAttribute('href', '/en/terms');
    await expect(en.getByRole('link', { name: 'privacy policy' })).toHaveAttribute('href', '/en/privacy');
  });

  test('Cross-links inside the legal texts point to the right pages', async ({ page }) => {
    await page.goto('/ro/termeni');
    const main = page.locator('main');
    await expect(main.getByRole('link', { name: 'politica de retur' }).first()).toHaveAttribute('href', '/ro/retur');
    await expect(main.getByRole('link', { name: 'politica de confidențialitate' })).toHaveAttribute('href', '/ro/confidentialitate');
    await expect(main.getByRole('link', { name: 'La comandă' }).first()).toHaveAttribute('href', '/ro/la-comanda');
    await page.goto('/en/terms');
    await expect(page.locator('main').getByRole('link', { name: 'returns policy' }).first()).toHaveAttribute('href', '/en/returns');
  });
});
