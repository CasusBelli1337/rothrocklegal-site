/**
 * Crawls the static export in out/ and fails loudly on any internal link,
 * image, or asset that does not resolve to a file in the export.
 * Run after `next build`: node scripts/check-links.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');

function collectHtmlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectHtmlFiles(full));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
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

const htmlFiles = collectHtmlFiles(OUT);
if (htmlFiles.length < 30) {
  console.error(`FAIL: only ${htmlFiles.length} HTML files in out/ — expected 30+.`);
  process.exit(1);
}

const attrRe = /(?:href|src)="([^"]+)"|content="0;url=([^"]+)"/g;
let checked = 0;
const broken = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  for (const match of html.matchAll(attrRe)) {
    const url = match[1] ?? match[2];
    if (/^(https?:|mailto:|tel:|data:|#|about:)/.test(url)) continue;
    checked += 1;
    if (url.startsWith('/')) {
      if (!resolves(url)) broken.push(`${path.relative(OUT, file)} -> ${url}`);
    } else {
      const abs = path.resolve(dir, url.split('#')[0].split('?')[0]);
      const rel = `/${path.relative(OUT, abs)}`;
      if (!resolves(rel)) broken.push(`${path.relative(OUT, file)} -> ${url}`);
    }
  }
}

if (broken.length > 0) {
  console.error(`FAIL: ${broken.length} broken internal references:`);
  for (const line of [...new Set(broken)]) console.error(`  ${line}`);
  process.exit(1);
}
console.log(`OK: ${htmlFiles.length} pages, ${checked} internal references, 0 broken.`);
