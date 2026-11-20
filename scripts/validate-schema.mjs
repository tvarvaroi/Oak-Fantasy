// Structured-data check (2026-11-20): every product page + the catalog, RO + EN.
//
//   node scripts/validate-schema.mjs                                 # live site
//   BASE_URL=http://localhost:3001 node scripts/validate-schema.mjs  # local prod build
//
// Three layers, on every page:
//   1. schema.org vocabulary (offline, always): every @type exists, every
//      property is defined for that type (or a supertype), every
//      https://schema.org/… enum value exists — the official vocabulary file
//      from schema.org, the same check that gives INVALID_PREDICATE in the
//      validator.
//   2. validator.schema.org (online, Google's Schema Markup Validator engine):
//      errors + warnings. Google rate-limits it (302 → /sorry captcha after a
//      few dozen calls); then the page is reported as SKIPPED, not passed.
//   3. Merchant-listing fields on every Product: image (absolute), brand,
//      price > 0, RON, availability, shippingDetails, hasMerchantReturnPolicy.
//
// Only the page's JSON-LD blocks are sent to the validator (public data; no
// cookies, no secrets). Exit 1 on any error or missing field.

const BASE = (process.env.BASE_URL || 'https://oakfantasy.ro').replace(/\/$/, '');
const CATALOGS = ['/ro/tocatoare', '/en/cutting-boards'];
const VOCAB_URL = 'https://schema.org/version/latest/schemaorg-current-https.jsonld';
const S = 'https://schema.org/';

// ---------- 1. schema.org vocabulary ----------
const ids = (v) => (v == null ? [] : (Array.isArray(v) ? v : [v]).map((x) => x['@id']));
const vocab = (await (await fetch(VOCAB_URL)).json())['@graph'];
const terms = new Map(vocab.map((t) => [t['@id'].replace(/^schema:/, ''), t]));
const parents = (c) => ids(terms.get(c)?.['rdfs:subClassOf']).map((x) => x.replace(/^schema:/, ''));
function ancestors(c, seen = new Set()) {
  if (seen.has(c)) return seen;
  seen.add(c);
  for (const p of parents(c)) ancestors(p, seen);
  return seen;
}
const isClass = (c) => {
  const t = [].concat(terms.get(c)?.['@type'] ?? []);
  return t.includes('rdfs:Class');
};

function vocabErrors(node, path = '$') {
  const out = [];
  if (Array.isArray(node)) {
    node.forEach((n, i) => out.push(...vocabErrors(n, `${path}[${i}]`)));
    return out;
  }
  if (typeof node === 'string') {
    if (node.startsWith(S) && !/^https:\/\/schema\.org\/?$/.test(node) && !terms.has(node.slice(S.length))) {
      out.push(`${path}: unknown schema.org value ${node}`);
    }
    return out;
  }
  if (!node || typeof node !== 'object') return out;
  const type = node['@type'];
  if (type) {
    if (!isClass(type)) out.push(`${path}: unknown type ${type}`);
    const anc = ancestors(type);
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('@')) continue;
      const prop = terms.get(k);
      if (!prop) out.push(`${path}.${k}: unknown property`);
      else {
        const domains = ids(prop['schema:domainIncludes']).map((x) => x.replace(/^schema:/, ''));
        if (!domains.some((d) => anc.has(d))) out.push(`${path}.${k}: not a property of ${type}`);
      }
    }
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === '@context' || k === '@type' || k === '@id') continue;
    if (k === 'url' || k === 'item' || k === 'sameAs' || k === 'logo' || k === 'image') continue; // plain URLs
    out.push(...vocabErrors(v, `${path}.${k}`));
  }
  return out;
}

// ---------- 2. validator.schema.org ----------
let validatorBlocked = false;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function remoteValidate(blocks) {
  if (validatorBlocked) return null;
  const html = blocks.map((b) => `<script type="application/ld+json">${b}</script>`).join('\n');
  await sleep(2500);
  const res = await fetch('https://validator.schema.org/validate', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ html }),
    redirect: 'manual',
  });
  const text = await res.text();
  if (res.status !== 200 || !text.startsWith(")]}'")) {
    validatorBlocked = true; // rate-limited (302 to google.com/sorry) or refused
    return null;
  }
  return JSON.parse(text.replace(/^\)\]\}'\s*/, ''));
}

// ---------- 3. merchant-listing fields ----------
function missingFields(p) {
  const o = p.offers ?? {};
  const miss = [];
  if (!Array.isArray(p.image) || p.image.length === 0) miss.push('image');
  else if (!p.image.every((u) => /^https:\/\//.test(u))) miss.push('image(absolute)');
  if (!p.brand?.name) miss.push('brand');
  if (!(Number(o.price) > 0)) miss.push('price');
  if (o.priceCurrency !== 'RON') miss.push('priceCurrency');
  if (!/^https:\/\/schema\.org\/(InStock|OutOfStock)$/.test(o.availability ?? '')) miss.push('availability');
  if (!o.shippingDetails) miss.push('shippingDetails');
  if (!o.hasMerchantReturnPolicy) miss.push('hasMerchantReturnPolicy');
  return miss;
}

function ldBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
}

const pages = [...CATALOGS];
for (const catalog of CATALOGS) {
  const html = await (await fetch(BASE + catalog)).text();
  const list = ldBlocks(html).map((b) => JSON.parse(b)).find((j) => j['@type'] === 'ItemList');
  for (const e of list?.itemListElement ?? []) pages.push(new URL(e.item.url).pathname);
}

console.log(`${BASE} — ${pages.length} pages (schema.org vocabulary: ${terms.size} terms)\n`);
let failed = false;
let remoteChecked = 0;
for (const path of pages) {
  const res = await fetch(BASE + path);
  const blocks = ldBlocks(await res.text());
  const json = blocks.map((b) => JSON.parse(b));
  const products = json.flatMap((j) =>
    j['@type'] === 'Product' ? [j] : j['@type'] === 'ItemList' ? j.itemListElement.map((e) => e.item) : [],
  );
  const vocabProblems = json.flatMap((j) => vocabErrors(j));
  const fieldProblems = products.flatMap((p) => missingFields(p).map((f) => `${p.sku}: missing ${f}`));
  const v = await remoteValidate(blocks);
  if (v) remoteChecked++;
  const remoteProblems = v ? (v.errors ?? []).map((e) => `validator: ${e.errorType} ${e.args?.join(' ')}`) : [];
  const remoteBad = v ? v.totalNumErrors > 0 || v.totalNumWarnings > 0 : false;
  const ok =
    res.status === 200 && products.length > 0 && !vocabProblems.length && !fieldProblems.length && !remoteBad;
  if (!ok) failed = true;
  const remote = v ? `validator errors=${v.totalNumErrors} warnings=${v.totalNumWarnings}` : 'validator SKIPPED';
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${path}  [${res.status}] products=${products.length} ` +
      `(${products.map((p) => p.sku).join(',')}) vocabulary=${vocabProblems.length ? 'ERR' : 'ok'} ${remote}`,
  );
  for (const line of [...vocabProblems, ...fieldProblems, ...remoteProblems]) console.log(`       ${line}`);
}

console.log(
  `\nvalidator.schema.org: ${remoteChecked}/${pages.length} pages checked` +
    (validatorBlocked ? ' (rate-limited by Google for the rest — re-run later for those)' : ''),
);
console.log(failed ? 'FAILED' : 'ALL OK');
process.exit(failed ? 1 : 0);
