/**
 * Lens gates over the static export in out/ (docs/LENS.md):
 *  1. every data-slot on the homepage, /library/, and /contact/ carries all
 *     three framings (neutral, trustee, beneficiary), so the CSS always has
 *     something to show, and the pages carry at least the expected number;
 *  2. the boot script sits in <head> and <html> carries no data-lens at rest,
 *     so crawlers and no-JS readers get the neutral site; the reading-options
 *     boot script (src/lib/a11y/boot.ts) sits beside it under the same rules;
 *  3. the production export has no trace of the preview-only lens switcher.
 * Run after `next build`: node scripts/check-lens.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');
const LENSES = ['neutral', 'trustee', 'beneficiary'];
/** Page → minimum distinct slots it must carry. */
const PAGES = { '/': 10, '/library/': 1, '/contact/': 1 };
const PREVIEW_TRACES = ['PreviewLensSwitch', 'Preview lens', 'preview:'];
const failures = [];

function read(rel) {
  return fs.readFileSync(path.join(OUT, rel, 'index.html'), 'utf8');
}

/** slot name → set of lenses its variants cover. */
function slotsIn(html) {
  const slots = new Map();
  for (const tag of html.matchAll(/<(?:span|div)\b([^>]*)>/g)) {
    const name = /data-slot="([^"]+)"/.exec(tag[1])?.[1];
    if (!name) continue;
    const covered = slots.get(name) ?? new Set();
    for (const lens of (/data-for="([^"]+)"/.exec(tag[1])?.[1] ?? '').split(' ')) covered.add(lens);
    slots.set(name, covered);
  }
  return slots;
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
const boot =
  /<script>(try\{var s=JSON\.parse\(localStorage\.getItem\('rl-lens'\)\)[\s\S]*?)<\/script>/.exec(
    head,
  );
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

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
let scanned = 0;
for (const file of walk(OUT).filter((f) => /\.(html|js|css|txt|json)$/.test(f))) {
  const text = fs.readFileSync(file, 'utf8');
  scanned += 1;
  for (const trace of PREVIEW_TRACES) {
    if (text.includes(trace))
      failures.push(`${path.relative(OUT, file)}: preview-only trace "${trace}"`);
  }
}

console.log(
  `checked ${totalSlots} slot groups, boot scripts ${boot ? Buffer.byteLength(boot[1]) : 0} + ${a11y ? Buffer.byteLength(a11y[1]) : 0} bytes, ${scanned} files scanned for preview traces`,
);
if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} problem(s):`);
  for (const line of failures) console.error(`  ${line}`);
  process.exit(1);
}
console.log('OK: lens gates pass.');
