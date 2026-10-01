#!/usr/bin/env node
/**
 * Generates public/images/library/<slug>.webp (1200×675) for every library
 * article whose `image` file is missing: maroon gradient by category, brass
 * rule, the title in Newsreader, and a small "Rothrock Legal · Library" mark.
 * Then, for every article, the social-card copy public/images/og/library/<slug>.jpg:
 * the cover centre-cropped to 1200×630 (the size Facebook, LinkedIn, and X expect)
 * as JPEG, because LinkedIn and some chat apps do not read WebP. The 22 px trimmed
 * top and bottom are empty gradient on a generated cover. Idempotent.
 *
 *   node scripts/make-covers.mjs [--force]
 *
 * Needs `sharp` (devDependency). Newsreader ships as scripts/fonts/ (OFL).
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content', 'library');
const FONT = path.join(ROOT, 'scripts', 'fonts', 'Newsreader[opsz,wght].ttf');
const FORCE = process.argv.includes('--force');
const WIDTH = 1200;
const HEIGHT = 675;
const OG_DIR = path.join(ROOT, 'public', 'images', 'og', 'library');
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const MARGIN = 96;

/**
 * Gradient stops per category. Every cover sits in the deep end of the scale so it
 * reads as one family with the site's `band-maroon` (maroon-900 #3F0226 to
 * maroon-950 #2B0119): the top stop stays between maroon-900 and maroon-800
 * (#52032F), the bottom between maroon-950 and #1A010B, and categories differ
 * only slightly. The lighter tops (#66043D and up) read pink beside the bands
 * and were retired 2026-09-03 (Arthur).
 */
const GRADIENTS = {
  Deadlines: ['#52032F', '#2B0119'],
  'Trust Contests': ['#4C022C', '#280117'],
  'Will Contests': ['#48022A', '#240114'],
  'Undue Influence & Capacity': ['#3F0226', '#1A010B'],
  'Trustees & Fiduciaries': ['#4E032D', '#2B0119'],
  'Elder Financial Abuse': ['#44022A', '#200110'],
  'Probate Process': ['#430228', '#22010F'],
  'For Trustees': ['#50032E', '#280117'],
  'Complex Estates': ['#45022A', '#1E0111'],
  'Business Disputes': ['#4A022C', '#1E0111'],
  'Technology & the Law': ['#3F0226', '#1A010B'],
};

function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) throw new Error('missing frontmatter');
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    meta[line.slice(0, sep).trim()] = line
      .slice(sep + 1)
      .trim()
      .replace(/^"(.*)"$/, '$1');
  }
  return meta;
}

function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function background(category) {
  const [from, to] = GRADIENTS[category] ?? GRADIENTS['Trust Contests'];
  return Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.05" r="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.09"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <rect x="${MARGIN}" y="196" width="72" height="4" fill="#C9932B"/>
  <rect x="${MARGIN}" y="${HEIGHT - 88}" width="${WIDTH - MARGIN * 2}" height="1" fill="#ffffff" fill-opacity="0.18"/>
</svg>`);
}

/** Renders one text layer with Pango markup; `sizes` are tried in order until the block fits. */
async function textLayer(markup, font, width, maxHeight, sizes) {
  for (const size of sizes) {
    const layer = await sharp({
      text: { text: markup, font: `${font} ${size}`, fontfile: FONT, width, dpi: 72, rgba: true },
    })
      .png()
      .toBuffer({ resolveWithObject: true });
    if (layer.info.height <= maxHeight) return layer;
  }
  throw new Error(`Text does not fit at any size: ${markup.slice(0, 60)}`);
}

async function makeCover(article, outFile) {
  const white = (text, alpha) => `<span foreground="#ffffff${alpha}">${escapeXml(text)}</span>`;
  const eyebrow = await textLayer(
    `<span letter_spacing="4096">${white(article.category.toUpperCase(), 'C0')}</span>`,
    'Newsreader Medium',
    WIDTH - MARGIN * 2,
    60,
    [22],
  );
  const title = await textLayer(
    white(article.title, 'FF'),
    'Newsreader Medium',
    1000,
    330,
    [64, 56, 48, 42, 36],
  );
  const mark = await textLayer(
    white('Rothrock Legal · Library', 'CC'),
    'Newsreader',
    600,
    60,
    [24],
  );
  await sharp(background(article.category))
    .composite([
      { input: eyebrow.data, left: MARGIN, top: 150 },
      { input: title.data, left: MARGIN - 2, top: 232 },
      { input: mark.data, left: MARGIN, top: HEIGHT - 72 },
    ])
    .webp({ quality: 84 })
    .toFile(outFile);
}

/** The JPEG social card beside the cover; returns true when it was written. */
async function makeOgCard(slug, coverFile) {
  const ogFile = path.join(OG_DIR, `${slug}.jpg`);
  if (fs.existsSync(ogFile) && !FORCE) return false;
  if (!fs.existsSync(coverFile)) throw new Error(`no image to make ${slug}.jpg from: ${coverFile}`);
  fs.mkdirSync(OG_DIR, { recursive: true });
  await sharp(coverFile)
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(ogFile);
  console.log(`made /images/og/library/${slug}.jpg (${Math.round(fs.statSync(ogFile).size / 1024)} KB)`);
  return true;
}

async function main() {
  if (!fs.existsSync(FONT)) throw new Error(`Font missing: ${FONT}`);
  const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.md'));
  let made = 0;
  let skipped = 0;
  let cards = 0;
  for (const file of files) {
    const meta = parseFrontmatter(fs.readFileSync(path.join(CONTENT, file), 'utf8'));
    const coverFile = path.join(ROOT, 'public', meta.image ?? '');
    const generated = meta.image?.startsWith('/images/library/');
    if (!generated || (fs.existsSync(coverFile) && !FORCE)) {
      skipped += 1;
    } else {
      fs.mkdirSync(path.dirname(coverFile), { recursive: true });
      await makeCover({ title: meta.title, category: meta.category }, coverFile);
      console.log(`made ${meta.image} (${Math.round(fs.statSync(coverFile).size / 1024)} KB)`);
      made += 1;
    }
    if (await makeOgCard(path.basename(file, '.md'), coverFile)) cards += 1;
  }
  const present = fs.readdirSync(OG_DIR).filter((f) => f.endsWith('.jpg')).length;
  if (present < files.length) throw new Error(`${present} social cards for ${files.length} articles`);
  console.log(
    `make-covers: ${made} covers generated, ${skipped} already present or using their own image, ` +
      `${cards} social cards written, ${files.length} articles`,
  );
}

main().catch((error) => {
  console.error(`make-covers failed: ${error.message}`);
  process.exit(1);
});
