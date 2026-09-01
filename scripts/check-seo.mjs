/**
 * SEO build gates (SEO-SPEC.md §13) over the static export in out/:
 *  1. every page has exactly one <h1>, a <title>, a meta description within
 *     src/config/seo-limits.json, a canonical, and an og:image;
 *  2. non-stub titles are unique (title cores over `titleMax` are reported, not failed:
 *     the spec's own templates run longer with the brand suffix);
 *  3. root has LegalService + WebSite JSON-LD and every JSON-LD block parses;
 *  4. sitemap.xml lists exactly the indexable pages (no stubs, drafts, or noindex pages);
 *     robots.txt exists; llms.txt lists every published article;
 *  5. no em dash anywhere in page text;
 *  6. no /post/ or /news-and-events/ output that is not a redirect stub.
 * Run after `next build`: node scripts/check-seo.mjs
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');
const limits = createRequire(import.meta.url)('../src/config/seo-limits.json');
const failures = [];
const warnings = [];

function pages(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...pages(full));
    else if (entry.name === 'index.html') files.push(full);
  }
  return files;
}

function attr(html, re) {
  const match = re.exec(html);
  return match ? match[1] : null;
}

/** Attribute text as a reader sees it, so `&#x27;` counts as one character. */
function decode(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function checkPage(file) {
  const rel = `/${path.relative(OUT, path.dirname(file))}`.replace(/\/$/, '') + '/';
  const html = fs.readFileSync(file, 'utf8');
  const stub = html.includes('http-equiv="refresh"');
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) failures.push(`${rel}: ${h1s} <h1> elements`);
  const title = attr(html, /<title>([^<]+)<\/title>/);
  if (!title) failures.push(`${rel}: missing <title>`);
  const description = attr(html, /<meta name="description" content="([^"]*)"/);
  if (!description) failures.push(`${rel}: missing meta description`);
  else if (decode(description).length > limits.descriptionMax)
    failures.push(`${rel}: description ${decode(description).length} chars`);
  if (rel !== '/404/' && !/<link rel="canonical"/.test(html)) failures.push(`${rel}: missing canonical`);
  if (!stub && !/<meta property="og:image"/.test(html)) failures.push(`${rel}: missing og:image`);
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '');
  if (text.includes('—')) failures.push(`${rel}: contains an em dash`);
  const types = [];
  for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(block[1]);
      for (const node of data['@graph'] ?? [data]) types.push(node['@type']);
    } catch {
      failures.push(`${rel}: JSON-LD does not parse`);
    }
  }
  if (/^\/(post|news-and-events)\//.test(rel) && !stub) failures.push(`${rel}: legacy path is not a stub`);
  return { rel, stub, noindex, html, title: title ? decode(title) : '', types };
}

const all = pages(OUT).map(checkPage);
const root = all.find((p) => p.rel === '/');
if (!root) failures.push('no root index.html');
else {
  if (!root.types.includes('LegalService')) failures.push('/: missing LegalService JSON-LD');
  if (!root.types.includes('WebSite')) failures.push('/: missing WebSite JSON-LD');
}

const seen = new Map();
for (const p of all.filter((p) => !p.stub)) {
  if (seen.has(p.title)) failures.push(`${p.rel}: title duplicates ${seen.get(p.title)}`);
  seen.set(p.title, p.rel);
  const core = p.title.replace(/ \| Rothrock Legal$/, '');
  if (core.length > limits.titleMax) warnings.push(`${p.rel}: title core ${core.length} chars`);
}

for (const name of ['sitemap.xml', 'robots.txt', 'llms.txt']) {
  if (!fs.existsSync(path.join(OUT, name))) failures.push(`missing ${name}`);
}
const sitemap = fs.existsSync(path.join(OUT, 'sitemap.xml'))
  ? [...fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => m[1].replace(/^https?:\/\/[^/]+/, ''),
    )
  : [];
const indexable = all.filter((p) => !p.stub && !p.noindex && p.rel !== '/404/').map((p) => p.rel);
for (const rel of indexable) if (!sitemap.includes(rel)) failures.push(`sitemap: missing ${rel}`);
for (const rel of sitemap) if (!indexable.includes(rel)) failures.push(`sitemap: lists non-indexable ${rel}`);

const llms = fs.existsSync(path.join(OUT, 'llms.txt')) ? fs.readFileSync(path.join(OUT, 'llms.txt'), 'utf8') : '';
for (const rel of indexable.filter((r) => /^\/library\/.+\/$/.test(r))) {
  if (!llms.includes(rel)) failures.push(`llms.txt: missing published article ${rel}`);
}
if (llms.includes('[CONFIRM]')) failures.push('llms.txt: carries a [CONFIRM] placeholder');

const stubs = all.filter((p) => p.stub).length;
console.log(
  `checked ${all.length} pages (${stubs} redirect stubs, ${indexable.length} indexable, sitemap ${sitemap.length} urls)`,
);
for (const line of warnings) console.log(`  warn: ${line}`);
if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} problem(s):`);
  for (const line of failures) console.error(`  ${line}`);
  process.exit(1);
}
console.log('OK: SEO gates pass.');
