/**
 * Crawls the static export in out/ and fails loudly on:
 *  1. any internal link, image, or asset that does not resolve to a file;
 *  2. a redirect stub whose target is missing or is itself a stub (IA.md §4e);
 *  3. an orphan page (no inbound internal link from another page, SEO-SPEC §9);
 *  4. an external link with target="_blank" but no rel="noopener".
 * Run after `next build`: node scripts/check-links.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');
/** Pages reached by other means than a link: the entry point, the not-found page, and the two emailed-link pages. */
const ORPHAN_EXEMPT = new Set(['/', '/404.html', '/404/', '/sign/', '/schedule/']);

function collectHtmlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectHtmlFiles(full));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

/** '/x/' for out/x/index.html, '/404.html' for a bare file, '/' for the root. */
function pagePath(file) {
  const rel = path.relative(OUT, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

function resolves(urlPath) {
  const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  if (clean === '' || clean === '/') return fs.existsSync(path.join(OUT, 'index.html'));
  const rel = clean.replace(/^\//, '');
  const candidates = [
    path.join(OUT, rel),
    path.join(OUT, rel, 'index.html'),
    path.join(OUT, `${rel.replace(/\/$/, '')}.html`),
  ];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

/** Site-absolute path ('/x/') for an href seen in `file`; null for external / non-page schemes. */
function toSitePath(url, file) {
  if (/^(https?:|mailto:|tel:|data:|#|about:)/.test(url)) return null;
  const bare = url.split('#')[0].split('?')[0];
  if (bare.startsWith('/')) return bare;
  const abs = path.resolve(path.dirname(file), bare);
  return `/${path.relative(OUT, abs).replace(/\\/g, '/')}`;
}

const htmlFiles = collectHtmlFiles(OUT);
if (htmlFiles.length < 30) {
  console.error(`FAIL: only ${htmlFiles.length} HTML files in out/ - expected 30+.`);
  process.exit(1);
}

const attrRe = /(?:href|src)="([^"]+)"|content="0;url=([^"]+)"/g;
const stubRe = /<meta http-equiv="refresh" content="0;url=([^"]+)"/;
const anchorRe = /<a\s[^>]*>/g;
let checked = 0;
const broken = [];
const chains = [];
const unsafe = [];
const stubs = new Map();
const inbound = new Map();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const from = pagePath(file);
  const stub = stubRe.exec(html);
  if (stub) stubs.set(from, toSitePath(stub[1], file));
  for (const match of html.matchAll(attrRe)) {
    const url = match[1] ?? match[2];
    const target = toSitePath(url, file);
    if (target === null) continue;
    checked += 1;
    if (!resolves(target)) broken.push(`${from} -> ${url}`);
    const page = target.endsWith('/') || target.endsWith('.html') ? target : `${target}/`;
    if (!stub && page !== from) {
      if (!inbound.has(page)) inbound.set(page, new Set());
      inbound.get(page).add(from);
    }
  }
  for (const tag of html.matchAll(anchorRe)) {
    if (/target="_blank"/.test(tag[0]) && !/rel="[^"]*noopener/.test(tag[0]))
      unsafe.push(`${from}: ${tag[0].slice(0, 120)}`);
  }
}

for (const [from, to] of stubs) {
  if (!resolves(to)) chains.push(`${from} -> ${to} (missing)`);
  else if (stubs.has(to)) chains.push(`${from} -> ${to} (two-hop: target is a stub)`);
}

const orphans = htmlFiles
  .map(pagePath)
  .filter((p) => !stubs.has(p) && !ORPHAN_EXEMPT.has(p) && !(inbound.get(p)?.size > 0));

const problems = [
  ...broken.map((l) => `broken: ${l}`),
  ...chains.map((l) => `stub: ${l}`),
  ...orphans.map((l) => `orphan: ${l}`),
  ...unsafe.map((l) => `noopener: ${l}`),
];
if (problems.length > 0) {
  console.error(`FAIL: ${problems.length} problem(s):`);
  for (const line of [...new Set(problems)]) console.error(`  ${line}`);
  process.exit(1);
}
console.log(
  `OK: ${htmlFiles.length} pages (${stubs.size} redirect stubs, all one hop), ${checked} internal references, 0 broken, 0 orphans.`,
);
