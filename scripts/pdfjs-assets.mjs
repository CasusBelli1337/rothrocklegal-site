/**
 * Copies pdf.js's runtime assets into public/pdfjs so the static export serves
 * them beside the pages: the worker (the fallback when the bundled worker
 * cannot start), the wasm decoders (JBIG2 and JPX scans render white without
 * them), and the standard fonts (PDFs that name a base-14 font without
 * embedding it). The folder is generated and git-ignored; `npm run build`
 * runs this first. Idempotent and count-verified.
 * Run by hand: node scripts/pdfjs-assets.mjs
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pdfjsRoot = path.dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json'));
const dest = path.join(root, 'public', 'pdfjs');

const FOLDERS = ['wasm', 'standard_fonts'];
const FILES = ['build/pdf.worker.mjs'];

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

let copied = 0;
for (const folder of FOLDERS) {
  const from = path.join(pdfjsRoot, folder);
  if (!fs.existsSync(from)) throw new Error(`pdfjs-dist has no ${folder} folder at ${from}`);
  fs.cpSync(from, path.join(dest, folder), { recursive: true });
  const count = fs.readdirSync(path.join(dest, folder)).length;
  if (count === 0) throw new Error(`pdfjs-dist ${folder} folder is empty`);
  copied += count;
}
for (const file of FILES) {
  const from = path.join(pdfjsRoot, file);
  if (!fs.existsSync(from)) throw new Error(`pdfjs-dist has no ${file}`);
  fs.copyFileSync(from, path.join(dest, path.basename(file)));
  copied += 1;
}
console.log(`pdf.js assets: ${copied} files copied to ${path.relative(root, dest)}`);
