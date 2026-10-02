/**
 * Consent gates over the static export in out/ (docs/CONSENT.md):
 *  1. every page carries the consent boot script in <head>, under its byte cap,
 *     and no page's static <html> carries data-consent (the script stamps it);
 *  2. no static HTML or RSC payload references a Google tag host, so nothing from
 *     Google can load before the visitor says yes (the loader lives in JS chunks
 *     and runs only after consent);
 *  3. every page with a footer carries the privacy-choices bar (not hidden) and
 *     the footer's "Privacy choices" button;
 *  4. the privacy policy carries the "Cookies and your choices" section the bar links to;
 *  5. the firm's own counter (site.counter, docs/CONSENT.md "First-party counter"): every
 *     page with a footer carries its one inline loader, naming <origin>/c.js, except
 *     /sign/ and /schedule/, which never mention the counter host;
 *  6. no <script src> in static HTML points off the site, and the only off-site script
 *     any inline script names is the counter's.
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

/** site.counter's origin and canonicalHost, read from the source so this never drifts. */
function siteValue(pattern, what) {
  const source = fs.readFileSync(path.join(process.cwd(), 'src', 'config', 'site.ts'), 'utf8');
  const match = pattern.exec(source);
  if (!match) {
    console.error(`FAIL: cannot read ${what} from src/config/site.ts`);
    process.exit(1);
  }
  return match[1];
}
const COUNTER_ORIGIN = siteValue(/counter:\s*\{\s*origin:\s*'([^']*)'/, 'site.counter.origin');
const CANONICAL = siteValue(/canonicalHost:\s*'([^']+)'/, 'site.canonicalHost');
const COUNTER_HOST = COUNTER_ORIGIN ? new URL(COUNTER_ORIGIN).host : null;
const COUNTER_LOADER = /<script data-counter="">([\s\S]*?)<\/script>/g;
const NO_COUNTER = /^(sign|schedule)\//;

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

/** Gate 5 for one page: the loader where it belongs, and nowhere near the emailed-link pages. */
function checkCounter(rel, html) {
  const loaders = [...html.matchAll(COUNTER_LOADER)];
  if (NO_COUNTER.test(rel) || !COUNTER_HOST || !html.includes('<footer')) {
    if (loaders.length > 0) failures.push(`${rel}: carries the counter loader`);
    if (COUNTER_HOST && NO_COUNTER.test(rel) && html.includes(COUNTER_HOST))
      failures.push(`${rel}: mentions ${COUNTER_HOST}`);
    return 0;
  }
  if (loaders.length !== 1) failures.push(`${rel}: ${loaders.length} counter loaders, expected 1`);
  else if (!loaders[0][1].includes(`${COUNTER_ORIGIN}/c.js`))
    failures.push(`${rel}: counter loader does not name ${COUNTER_ORIGIN}/c.js`);
  return loaders.length === 1 ? 1 : 0;
}

/** Gate 6 for one page: returns the off-site hosts its inline scripts load from. */
function offSiteScripts(rel, html) {
  for (const [, src] of html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g)) {
    if (/^(https?:)?\/\//.test(src) && !src.startsWith(`${CANONICAL}/`))
      failures.push(`${rel}: <script src> off the site: ${src}`);
  }
  const hosts = new Set();
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/application\/ld\+json/.test(attrs)) continue;
    for (const [, host] of body.matchAll(/https?:\/\/([a-z0-9.-]+)\/[^"'\s\\]*\.js\b/gi)) {
      if (`https://${host}` !== CANONICAL) hosts.add(host);
    }
  }
  return hosts;
}

let bootBytes = 0;
let withBar = 0;
let withCounter = 0;
const scriptHosts = new Set();
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
  withCounter += checkCounter(rel, html);
  for (const host of offSiteScripts(rel, html)) scriptHosts.add(host);
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

for (const host of scriptHosts) {
  if (host !== COUNTER_HOST) failures.push(`an inline script loads from ${host}`);
}
if (COUNTER_HOST && withCounter === 0) failures.push('no page carries the counter loader');
for (const page of ['sign/index.html', 'schedule/index.html']) {
  if (!pages.includes(path.join(OUT, page))) failures.push(`${page} missing from out/`);
}

const policy = fs.readFileSync(path.join(OUT, 'privacy-policy', 'index.html'), 'utf8');
if (!policy.includes('id="cookies-and-your-choices"'))
  failures.push('/privacy-policy/: "Cookies and your choices" section missing');

console.log(
  `checked ${pages.length} pages (${withBar} with the bar, ${withCounter} with the counter loader), boot script ${bootBytes} bytes, ${scanned} files scanned for Google tag hosts, off-site script hosts: ${[...scriptHosts].join(', ') || 'none'}`,
);
if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} problem(s):`);
  for (const line of failures.slice(0, 40)) console.error(`  ${line}`);
  process.exit(1);
}
console.log('OK: consent gates pass.');
