/**
 * SEO build gates (SEO-SPEC.md §13) over the static export in out/:
 *  1. every page has exactly one <h1>, a <title>, a meta description ≤ 160 chars,
 *     a canonical, and an og:image;
 *  2. root has LegalService + WebSite JSON-LD and every JSON-LD block parses;
 *  3. sitemap.xml, robots.txt, and llms.txt exist;
 *  4. no em dash (—) anywhere in page text;
 *  5. no /post/ or /news-and-events/ output that is not a redirect stub.
 * Run after `next build`: node scripts/check-seo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');
const failures = [];

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

function isStub(html) {
  return html.includes('http-equiv="refresh"');
}

function checkPage(file) {
  const rel = `/${path.relative(OUT, path.dirname(file))}`.replace(/\/$/, '') + '/';
  const html = fs.readFileSync(file, 'utf8');
  const stub = isStub(html);
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) failures.push(`${rel}: ${h1s} <h1> elements`);
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${rel}: missing <title>`);
  const description = attr(html, /<meta name="description" content="([^"]*)"/);
  if (!description) failures.push(`${rel}: missing meta description`);
  else if (description.length > 160) failures.push(`${rel}: description ${description.length} chars`);
  if (rel !== '/404/' && !/<link rel="canonical"/.test(html)) failures.push(`${rel}: missing canonical`);
  if (!stub && !/<meta property="og:image"/.test(html)) failures.push(`${rel}: missing og:image`);
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '');
  if (text.includes('—')) failures.push(`${rel}: contains an em dash`);
  for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(block[1]);
    } catch {
      failures.push(`${rel}: JSON-LD does not parse`);
    }
  }
  if (/^\/(post|news-and-events)\//.test(rel) && !stub) failures.push(`${rel}: legacy path is not a stub`);
  return { rel, stub, html };
}

const all = pages(OUT).map(checkPage);
const root = all.find((p) => p.rel === '/');
if (!root) failures.push('no root index.html');
else {
  if (!root.html.includes('"LegalService"')) failures.push('/: missing LegalService JSON-LD');
  if (!root.html.includes('"WebSite"')) failures.push('/: missing WebSite JSON-LD');
}
for (const name of ['sitemap.xml', 'robots.txt', 'llms.txt']) {
  if (!fs.existsSync(path.join(OUT, name))) failures.push(`missing ${name}`);
}

const stubs = all.filter((p) => p.stub).length;
console.log(`checked ${all.length} pages (${stubs} redirect stubs)`);
if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} problem(s):`);
  for (const line of failures) console.error(`  ${line}`);
  process.exit(1);
}
console.log('OK: SEO gates pass.');
