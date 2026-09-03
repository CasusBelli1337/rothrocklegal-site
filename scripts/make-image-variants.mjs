#!/usr/bin/env node
/**
 * Generates the responsive crops that the site's `<picture>` elements reference,
 * each from one source file. `next/image` is `unoptimized` on this static export,
 * so width variants are produced here instead of at request time. Idempotent:
 * existing files are kept unless --force. Fails loudly if any output is missing.
 *
 *   node scripts/make-image-variants.mjs [--force]
 *
 * Needs `sharp` (devDependency).
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = process.cwd();
const FORCE = process.argv.includes('--force');

/** Every entry has a matching `<picture>` in src/components; keep the two in step. */
const VARIANTS = [
  {
    // components/home/Hero.tsx: aspect-[3/2] under lg, aspect-[4/5] at lg+, cropped from the top.
    source: 'public/images/arthur-hero.webp',
    crops: [
      { name: 'wide', aspect: [3, 2], widths: [768, 1024, 1280] },
      { name: 'tall', aspect: [4, 5], widths: [480, 960] },
    ],
  },
];

function outputFor(source, crop, width) {
  const ext = path.extname(source);
  return source.slice(0, -ext.length) + `-${crop}-${width}${ext}`;
}

function allOutputs() {
  return VARIANTS.flatMap((entry) =>
    entry.crops.flatMap((crop) => crop.widths.map((w) => outputFor(entry.source, crop.name, w))),
  );
}

async function build(entry) {
  const input = path.join(ROOT, entry.source);
  if (!fs.existsSync(input)) throw new Error(`Missing source image: ${entry.source}`);
  const meta = await sharp(input).metadata();
  let written = 0;
  for (const crop of entry.crops) {
    for (const width of crop.widths) {
      const height = Math.round((width * crop.aspect[1]) / crop.aspect[0]);
      if (width > meta.width || height > meta.height) {
        throw new Error(`${entry.source}: ${width}x${height} exceeds the ${meta.width}x${meta.height} source`);
      }
      const out = path.join(ROOT, outputFor(entry.source, crop.name, width));
      if (fs.existsSync(out) && !FORCE) continue;
      await sharp(input)
        .resize({ width, height, fit: 'cover', position: 'top' })
        .webp({ quality: 82 })
        .toFile(out);
      written++;
    }
  }
  return written;
}

let written = 0;
for (const entry of VARIANTS) written += await build(entry);

// Count verification: every variant must exist and be non-empty.
const missing = allOutputs().filter((rel) => {
  const abs = path.join(ROOT, rel);
  return !fs.existsSync(abs) || fs.statSync(abs).size === 0;
});
if (missing.length > 0) {
  console.error('Image variants missing or empty:', missing.join(', '));
  process.exit(1);
}
console.log(`image variants: ${allOutputs().length} expected, ${written} written, 0 missing`);
