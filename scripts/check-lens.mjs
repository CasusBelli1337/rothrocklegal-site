/**
 * Lens gates over the static export in out/ (docs/LENS.md):
 *  1. every data-slot on the homepage, /library/, /contact/, and Arthur's bio carries all
 *     three framings (neutral, trustee, beneficiary), and the pages carry at least the
 *     expected number;
 *  2. on every page of the export, each slot's neutral framing is visible and every other
 *     framing carries the HTML `hidden` attribute, so a reader of the raw HTML (an AI tool,
 *     a text extractor, a no-JS browser) meets one framing per slot, and the homepage <h1>
 *     reads as one headline;
 *  3. the boot script sits in <head> under 400 bytes and <html> carries no data-lens at
 *     rest; the reading-options boot script (src/lib/a11y/boot.ts) sits beside it under
 *     the same rules;
 *  4. the production export has no trace of the preview-only lens switcher.
 * The third boot script (consent) has its own gates in scripts/check-consent.mjs.
 * Run after `next build`: node scripts/check-lens.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');
const LENSES = ['neutral', 'trustee', 'beneficiary'];
/** Page → minimum distinct slots it must carry. */
const PAGES = { '/': 10, '/library/': 1, '/contact/': 1, '/attorneys/arthur-rothrock/': 2 };
const PREVIEW_TRACES = ['PreviewLensSwitch', 'Preview lens', 'preview:'];
const failures = [];

function read(rel) {
  return fs.readFileSync(path.join(OUT, rel, 'index.html'), 'utf8');
}

/** Every slot variant tag in a page: its slot name, the lenses it serves, and whether it is hidden. */
function variantsIn(html) {
  return [...html.matchAll(/<(?:span|div)\b([^>]*)>/g)]
    .map((tag) => ({
      name: /data-slot="([^"]+)"/.exec(tag[1])?.[1],
      lenses: (/data-for="([^"]+)"/.exec(tag[1])?.[1] ?? '').split(' '),
      hidden: /\shidden(?:=""|\s|$)/.test(tag[1]),
    }))
    .filter((variant) => variant.name);
}

/** slot name → set of lenses its variants cover. */
function slotsIn(html) {
  const slots = new Map();
  for (const { name, lenses } of variantsIn(html)) {
    const covered = slots.get(name) ?? new Set();
    for (const lens of lenses) covered.add(lens);
    slots.set(name, covered);
  }
  return slots;
}

/** Neutral framing visible, every other framing hidden; returns the visible variant count per slot. */
function checkHidden(rel, html) {
  const visible = new Map();
  for (const { name, lenses, hidden } of variantsIn(html)) {
    const neutral = lenses.includes('neutral');
    if (neutral && hidden) failures.push(`${rel}: slot "${name}" hides its neutral framing`);
    if (!neutral && !hidden)
      failures.push(`${rel}: slot "${name}" shows its ${lenses.join('/')} framing without hidden`);
    if (!hidden) visible.set(name, (visible.get(name) ?? 0) + 1);
  }
  for (const [name, count] of visible)
    if (count !== 1) failures.push(`${rel}: slot "${name}" has ${count} visible framings`);
  return visible.size;
}

let totalSlots = 0;
for (const [rel, minimum] of Object.entries(PAGES)) {
  const html = read(rel);
  const slots = slotsIn(html);
  if (slots.size < minimum)
    failures.push(`${rel}: ${slots.size} slots, expected at least ${minimum}`);
  for (const [name, covered] of slots) {
    const missing = LENSES.filter((lens) => !covered.has(lens));
    const extra = [...covered].filter((lens) => !LENSES.includes(lens));
    if (missing.length > 0)
      failures.push(`${rel}: slot "${name}" has no ${missing.join('/')} variant`);
    if (extra.length > 0)
      failures.push(`${rel}: slot "${name}" has unknown lens ${extra.join('/')}`);
  }
  totalSlots += slots.size;
  console.log(`${rel}: ${slots.size} slots (${[...slots.keys()].join(', ')})`);
}

const root = read('/');
const head = root.slice(0, root.indexOf('</head>'));
const boot = /<script>(try\{(?:(?!<\/script>)[\s\S])*?'rl-lens'[\s\S]*?)<\/script>/.exec(head);
if (!boot) failures.push('/: lens boot script missing from <head>');
else if (Buffer.byteLength(boot[1]) >= 400)
  failures.push(`/: boot script is ${Buffer.byteLength(boot[1])} bytes`);
if (/<html[^>]*\sdata-lens=/.test(root))
  failures.push('/: <html> carries data-lens in the static HTML');
const a11y =
  /<script>(try\{var p=JSON\.parse\(localStorage\.getItem\('rl-a11y'\)\)[\s\S]*?)<\/script>/.exec(
    head,
  );
if (!a11y) failures.push('/: reading-options boot script missing from <head>');
else if (Buffer.byteLength(a11y[1]) >= 400)
  failures.push(`/: reading-options boot script is ${Buffer.byteLength(a11y[1])} bytes`);
if (/<html[^>]*\sdata-(text-size|contrast|motion|spacing)=/.test(root))
  failures.push('/: <html> carries a reading option in the static HTML');
if ((root.match(/<h1[\s>]/g) ?? []).length !== 1)
  failures.push('/: hero variants must live inside the one <h1>');
const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(root)?.[1] ?? '';
const h1Visible = variantsIn(h1).filter((variant) => !variant.hidden).length;
if (h1Visible !== 1) failures.push(`/: the <h1> shows ${h1Visible} framings in the raw HTML`);
const h1Text = h1
  .replace(/<(span|div)\b[^>]*\shidden=""[^>]*>[\s\S]*?<\/\1>/g, '')
  .replace(/<[^>]+>/g, '')
  .trim();
console.log(`/: raw <h1> without hidden framings: "${h1Text}"`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
let scanned = 0;
let pagesWithSlots = 0;
let visibleSlots = 0;
for (const file of walk(OUT).filter((f) => /\.(html|js|css|txt|json)$/.test(f))) {
  const text = fs.readFileSync(file, 'utf8');
  scanned += 1;
  if (file.endsWith('.html') && text.includes('data-for=')) {
    pagesWithSlots += 1;
    visibleSlots += checkHidden(path.relative(OUT, file), text);
  }
  for (const trace of PREVIEW_TRACES) {
    if (text.includes(trace))
      failures.push(`${path.relative(OUT, file)}: preview-only trace "${trace}"`);
  }
}

if (pagesWithSlots === 0) failures.push('no page in out/ carries a lens slot');
console.log(
  `checked ${totalSlots} slot groups, ${visibleSlots} slots on ${pagesWithSlots} pages with neutral visible and the rest hidden, boot scripts ${boot ? Buffer.byteLength(boot[1]) : 0} + ${a11y ? Buffer.byteLength(a11y[1]) : 0} bytes, ${scanned} files scanned for preview traces`,
);
if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} problem(s):`);
  for (const line of failures) console.error(`  ${line}`);
  process.exit(1);
}
console.log('OK: lens gates pass.');
