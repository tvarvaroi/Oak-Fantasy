#!/usr/bin/env node
/**
 * Oak Fantasy — i18n completeness checker.
 *
 * Zero-dep Node ES module. Scans components/ for:
 *  - Legacy Romanian cedilla diacritics (ş/ţ) — should be ș/ț (comma below)
 *  - Content-map locale-key parity (ro: keys === en: keys)
 *  - Romanian diacritics inside en: blocks (= forgotten translations)
 *  - [warning-only] Hardcoded JSX text that looks like RO/EN copy
 *
 * Exit code: 0 if no errors (warnings OK), 1 if any errors.
 * Use --json for machine-readable output.
 */

import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { argv, cwd, exit } from 'node:process';

const ROOT = cwd();
const JSON_OUTPUT = argv.includes('--json');

const c = JSON_OUTPUT
  ? { red: '', green: '', yellow: '', gray: '', reset: '' }
  : { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', gray: '\x1b[90m', reset: '\x1b[0m' };

const errors = [];
const warnings = [];
const reportError = (file, line, issue, snippet = '') =>
  errors.push({ file: relative(ROOT, file).replaceAll('\\', '/'), line, issue, snippet });
const reportWarning = (file, line, issue, snippet = '') =>
  warnings.push({ file: relative(ROOT, file).replaceAll('\\', '/'), line, issue, snippet });

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (['node_modules', '.next', '__screenshots__', 'test-results', 'playwright-report'].includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const contentMaps = [];
const tsxFiles = [];
for await (const file of walk(join(ROOT, 'components'))) {
  if (file.endsWith('content.ts')) contentMaps.push(file);
  else if (file.endsWith('.tsx')) tsxFiles.push(file);
}

// ─── 1. Cedilla check ───────────────────────────────────────────────
const CEDILLA = /[şţŞŢ]/;
for (const file of [...contentMaps, ...tsxFiles]) {
  const text = await readFile(file, 'utf8');
  text.split('\n').forEach((line, idx) => {
    if (CEDILLA.test(line)) {
      reportError(file, idx + 1, 'Legacy Romanian cedilla diacritic (ş/ţ) — use ș/ț (comma below)', line.trim().slice(0, 100));
    }
  });
}

// ─── 2. Balanced-brace locale block extractor ───────────────────────
function extractLocaleBlock(text, locale) {
  const opener = new RegExp(`^\\s*${locale}:\\s*\\{`, 'm');
  const match = opener.exec(text);
  if (!match) return null;
  let depth = 1;
  let i = match.index + match[0].length;
  const start = i;
  while (i < text.length && depth > 0) {
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      i++;
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\') i += 2;
        else i++;
      }
    } else if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  return { content: text.slice(start, i - 1), offset: start };
}

const extractTopKeys = (block) => {
  const keys = new Set();
  // Match top-level keys only — naive but works on flat structure of content maps.
  // For nested objects, the keys at depth>0 are also matched, but parity check is sufficient.
  const re = /^\s*(\w+)\s*:/gm;
  let m;
  while ((m = re.exec(block)) !== null) keys.add(m[1]);
  return keys;
};

// ─── 3. RO/EN parity + RO chars in EN block ────────────────────────
const RO_CHARS = /[ăâîșțĂÂÎȘȚ]/g;
for (const file of contentMaps) {
  const text = await readFile(file, 'utf8');
  const ro = extractLocaleBlock(text, 'ro');
  const en = extractLocaleBlock(text, 'en');
  if (!ro || !en) continue;

  const roKeys = extractTopKeys(ro.content);
  const enKeys = extractTopKeys(en.content);
  for (const k of roKeys) if (!enKeys.has(k)) reportError(file, 0, `Missing EN key "${k}" (present in ro block)`);
  for (const k of enKeys) if (!roKeys.has(k)) reportError(file, 0, `Missing RO key "${k}" (present in en block)`);

  // RO chars inside EN block
  RO_CHARS.lastIndex = 0;
  let m;
  while ((m = RO_CHARS.exec(en.content)) !== null) {
    const abs = en.offset + m.index;
    const before = text.slice(0, abs);
    const lineNum = (before.match(/\n/g) ?? []).length + 1;
    const lineStart = before.lastIndexOf('\n') + 1;
    const lineEnd = text.indexOf('\n', abs);
    const snippet = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd).trim().slice(0, 100);
    reportError(file, lineNum, `Romanian diacritic "${m[0]}" in en: block — forgotten translation?`, snippet);
  }
}

// ─── 4. Hardcoded JSX text scan (warnings only) ────────────────────
const JSX_TEXT = />([^<>{}\n]+)</g;
const EN_COMMON = /\b(the|and|with|from|our|your)\b/i;
for (const file of tsxFiles) {
  const text = await readFile(file, 'utf8');
  text.split('\n').forEach((line, idx) => {
    JSX_TEXT.lastIndex = 0;
    let m;
    while ((m = JSX_TEXT.exec(line)) !== null) {
      const inner = m[1].trim();
      if (inner.length < 4) continue;
      const hasRo = /[ăâîșțĂÂÎȘȚ]/.test(inner);
      const hasEn = EN_COMMON.test(inner);
      if (hasRo || hasEn) {
        reportWarning(file, idx + 1, 'Potential hardcoded visible text in JSX — consider content map', inner.slice(0, 80));
      }
    }
  });
}

// ─── Output ────────────────────────────────────────────────────────
if (JSON_OUTPUT) {
  console.log(JSON.stringify({ passed: errors.length === 0, errors, warnings }, null, 2));
} else {
  if (errors.length === 0) {
    console.log(`${c.green}✓ i18n checks passed${c.reset} (${contentMaps.length} content maps, ${tsxFiles.length} tsx files scanned)`);
  } else {
    console.log(`${c.red}✗ ${errors.length} error${errors.length === 1 ? '' : 's'}${c.reset}`);
    for (const e of errors) {
      console.log(`  ${c.red}${e.file}:${e.line}${c.reset}  ${e.issue}`);
      if (e.snippet) console.log(`    ${c.gray}${e.snippet}${c.reset}`);
    }
  }
  if (warnings.length > 0) {
    console.log(`${c.yellow}⚠ ${warnings.length} warning${warnings.length === 1 ? '' : 's'}${c.reset}`);
    for (const w of warnings) {
      console.log(`  ${c.yellow}${w.file}:${w.line}${c.reset}  ${w.issue}`);
      if (w.snippet) console.log(`    ${c.gray}${w.snippet}${c.reset}`);
    }
  }
}

exit(errors.length === 0 ? 0 : 1);
