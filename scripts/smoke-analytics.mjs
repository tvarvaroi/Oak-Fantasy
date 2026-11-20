// Local smoke for Vercel Web Analytics on a production build (`next start`).
// Usage: node scripts/smoke-analytics.mjs <baseUrl> <path-to-production-script.js>
// The real script exists only on Vercel, so it is served from a local copy
// (curl https://oakfantasy.ro/_vercel/insights/script.js) and the beacons are
// captured instead of sent. Asserts: script injected, no CSP violation, /admin
// sends nothing, no identifier in any reported URL.
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [base = 'http://localhost:3100', scriptPath] = process.argv.slice(2);
if (!scriptPath) throw new Error('missing path to the production script');
const scriptBody = readFileSync(scriptPath, 'utf8');
const ORDER_ID = '3f2b8c1e-1111-2222-3333-444455556666';

const browser = await chromium.launch();
// The script ignores automated browsers (navigator.webdriver, "Headless" in
// the user agent); pretend to be a person.
const context = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
});
await context.addInitScript(() => {
  Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
});
const page = await context.newPage();
const beacons = [];
const csp = [];
page.on('console', (m) => {
  if (/Content Security Policy/i.test(m.text())) csp.push(m.text());
});
await page.route('**/_vercel/insights/script.js', (r) =>
  r.fulfill({ contentType: 'application/javascript', body: scriptBody }),
);
await page.route('**/_vercel/insights/{view,event,session}', (r) => {
  beacons.push({ endpoint: new URL(r.request().url()).pathname, at: page.url(), body: r.request().postDataJSON() });
  return r.fulfill({ status: 200, body: 'ok' });
});

const visits = [
  '/ro',
  '/ro/tocatoare?q=ion%40example.com&tier=core',
  `/ro/multumim/${ORDER_ID}`,
  '/en/login?email=ion@example.com&next=%2Fen%2Fcheckout',
  '/ro/pagina-inexistenta/OF-2026-0001',
  '/admin/login',
];
for (const path of visits) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
}
// Client-side navigation (pushState) must be counted too.
await page.goto(base + '/ro', { waitUntil: 'networkidle' });
await page.locator('a[href="/ro/tocatoare"]').first().click();
await page.waitForURL('**/ro/tocatoare');
await page.waitForTimeout(1200);

const scriptTags = await page.locator('script[src*="/_vercel/insights/script.js"]').count();
await browser.close();

for (const b of beacons) console.log(b.endpoint, '|', b.at.replace(base, ''), '→', b.body.o, '| route:', b.body.dp ?? '-', '| referrer:', b.body.r ?? '-');
const dump = JSON.stringify(beacons.map((b) => b.body));
const problems = [];
if (scriptTags !== 1) problems.push(`expected 1 script tag, found ${scriptTags}`);
if (csp.length) problems.push(`CSP violations: ${csp.join(' || ')}`);
if (beacons.some((b) => b.at.includes('/admin'))) problems.push('a beacon was sent from /admin');
if (/example\.com|%40|OF-2026|3f2b8c1e|[?#]/i.test(dump)) problems.push('identifier or query string in a payload');
if (beacons.length < 6) problems.push(`expected at least 6 page views, got ${beacons.length}`);
console.log('payload keys:', [...new Set(beacons.flatMap((b) => Object.keys(b.body)))].join(', '));
console.log(problems.length ? 'FAIL\n' + problems.join('\n') : `PASS (${beacons.length} beacons)`);
process.exit(problems.length ? 1 : 0);
