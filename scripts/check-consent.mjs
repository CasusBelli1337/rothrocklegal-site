/**
 * Consent gates over the static export in out/ (docs/CONSENT.md):
 *  1. every page carries the consent boot script in <head>, under its byte cap,
 *     and no page's static <html> carries data-consent (the script stamps it);
 *  2. no static HTML or RSC payload references a Google tag host, so nothing from
 *     Google can load before the visitor says yes (the loader lives in JS chunks
 *     and runs only after consent);
 *  3. every page with a footer carries the privacy-choices bar (not hidden) and
 *     the footer's "Privacy choices" button;
 *  4. the privacy policy carries the "Cookies and your choices" section the bar links to.
 * Run after `next build`: node scripts/check-consent.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');
/** Mirrors CONSENT_BOOT_MAX_BYTES in src/lib/consent/boot.ts. */
const BOOT_MAX_BYTES = 450;
const BOOT =
  /<script>(var d='ask';try\{var r=JSON\.parse\(localStorage\.getItem\('rl-consent'\)\)[\s\S]*?)<\/script>/;
const GOOGLE_HOSTS = ['googletagmanager.com', 'google-analytics.com'];
const FOOTER_LABEL = 'Privacy choices';
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

if (!fs.existsSync(OUT)) {
  console.error('FAIL: out/ is missing; run the build first.');
  process.exit(1);
}

const files = walk(OUT);
const pages = files.filter((f) => f.endsWith('.html'));
if (pages.length < 30) failures.push(`only ${pages.length} HTML files in out/; expected 30+`);

let bootBytes = 0;
let withBar = 0;
for (const file of pages) {
  const rel = path.relative(OUT, file);
  const html = fs.readFileSync(file, 'utf8');
  const head = html.slice(0, html.indexOf('</head>'));
  const boot = BOOT.exec(head);
  if (!boot) failures.push(`${rel}: consent boot script missing from <head>`);
  else {
    bootBytes = Buffer.byteLength(boot[1]);
    if (bootBytes >= BOOT_MAX_BYTES)
      failures.push(`${rel}: consent boot script is ${bootBytes} bytes`);
  }
  if (/<html[^>]*\sdata-consent=/.test(html)) failures.push(`${rel}: <html> carries data-consent`);
  if (!html.includes('<footer')) continue;
  const bar = /<section[^>]*data-consent-bar=""[^>]*>/.exec(html);
  if (!bar) failures.push(`${rel}: privacy-choices bar missing`);
  else if (/\shidden(=|\s|>)/.test(bar[0]))
    failures.push(`${rel}: bar is hidden in the static HTML`);
  else withBar += 1;
  if (!html.includes(`>${FOOTER_LABEL}</button>`))
    failures.push(`${rel}: footer "${FOOTER_LABEL}" button missing`);
}

let scanned = 0;
for (const file of files.filter((f) => /\.(html|txt)$/.test(f))) {
  const text = fs.readFileSync(file, 'utf8');
  scanned += 1;
  for (const host of GOOGLE_HOSTS) {
    if (text.includes(host)) failures.push(`${path.relative(OUT, file)}: references ${host}`);
  }
}

const policy = fs.readFileSync(path.join(OUT, 'privacy-policy', 'index.html'), 'utf8');
if (!policy.includes('id="cookies-and-your-choices"'))
  failures.push('/privacy-policy/: "Cookies and your choices" section missing');

console.log(
  `checked ${pages.length} pages (${withBar} with the bar), boot script ${bootBytes} bytes, ${scanned} files scanned for Google tag hosts`,
);
if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} problem(s):`);
  for (const line of failures.slice(0, 40)) console.error(`  ${line}`);
  process.exit(1);
}
console.log('OK: consent gates pass.');
