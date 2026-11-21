// IndexNow — send every URL of the live sitemap, ONCE, after a deploy that
// changed the whole site (the protocol's FAQ allows a full submission after a
// site-wide update; day-to-day changes are sent by the admin product actions,
// lib/admin/product-actions.ts → lib/indexnow.ts).
//
//   node scripts/indexnow-submit-sitemap.mjs --dry-run   # list the URLs, send nothing
//   node scripts/indexnow-submit-sitemap.mjs             # send
//
// Safety:
//   - the key is read from lib/indexnow.ts (one source), and the script first
//     checks that https://oakfantasy.ro/<key>.txt is live and contains it —
//     otherwise IndexNow would answer 403
//   - only URLs listed in the live sitemap are sent, minus anything outside
//     the host and anything robots.txt disallows (admin, auth, cart, checkout,
//     account pages) — belt and braces: the sitemap never lists those
//   - nothing is retried automatically; do not run it in a loop (429 = too often)
//
// Protocol (https://www.indexnow.org/documentation): POST JSON
// { host, key, urlList } to https://api.indexnow.org/indexnow, up to 10,000
// URLs. 200 = received, 202 = received, key validation pending, 400 bad
// format, 403 key not valid, 422 URLs not on the host, 429 too many requests.

import { readFileSync } from 'node:fs';

const SITE = 'https://oakfantasy.ro';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const DRY_RUN = process.argv.includes('--dry-run');

const key = readFileSync('lib/indexnow.ts', 'utf8').match(/INDEXNOW_KEY = '([A-Za-z0-9-]{8,128})'/)?.[1];
if (!key) {
  console.error('Could not read INDEXNOW_KEY from lib/indexnow.ts');
  process.exit(1);
}

const get = async (url) => {
  const res = await fetch(url, { redirect: 'manual' });
  return { status: res.status, body: await res.text() };
};

// 1. The key file must be live.
const keyFile = await get(`${SITE}/${key}.txt`);
if (keyFile.status !== 200 || keyFile.body.trim() !== key) {
  console.error(`Key file not live: GET ${SITE}/<key>.txt → ${keyFile.status}. Deploy first.`);
  process.exit(1);
}

// 2. URLs = the live sitemap, minus other hosts and robots-disallowed paths.
const sitemap = await get(`${SITE}/sitemap.xml`);
if (sitemap.status !== 200) {
  console.error(`sitemap.xml → ${sitemap.status}`);
  process.exit(1);
}
const robots = await get(`${SITE}/robots.txt`);
const disallowed = robots.status === 200
  ? [...robots.body.matchAll(/^Disallow:\s*(\S+)/gim)].map((m) => m[1])
  : null;
if (!disallowed) {
  console.error(`robots.txt → ${robots.status}; refusing to send without the private-path list.`);
  process.exit(1);
}

const listed = [...new Set([...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()))];
const urlList = [];
const dropped = [];
for (const url of listed) {
  let u;
  try {
    u = new URL(url);
  } catch {
    dropped.push(url);
    continue;
  }
  // "/admin" blocks /admin and /admin/…; "/api/" blocks everything under it.
  const isPrivate = disallowed.some((p) => u.pathname === p || u.pathname.startsWith(p.endsWith('/') ? p : `${p}/`));
  if (u.origin !== SITE || u.search || u.hash || isPrivate) dropped.push(url);
  else urlList.push(url);
}

console.log(`sitemap: ${listed.length} URLs · to send: ${urlList.length} · dropped: ${dropped.length}`);
for (const url of dropped) console.log(`  dropped  ${url}`);
if (DRY_RUN) {
  for (const url of urlList) console.log(`  ${url}`);
  console.log('dry run — nothing sent');
  process.exit(0);
}
if (urlList.length === 0) {
  console.error('Nothing to send.');
  process.exit(1);
}

// 3. One POST.
const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key, urlList }),
});
const body = (await res.text()).trim();
console.log(`IndexNow response: HTTP ${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 500)}` : ' (empty body)'}`);
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
