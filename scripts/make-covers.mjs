#!/usr/bin/env node
/**
 * Generates public/images/library/<slug>.webp (1200×675) for every library
 * article whose `image` file is missing: maroon gradient by category, brass
 * rule, the title in Newsreader, and a small "Rothrock Legal · Library" mark.
 * The same file serves as the article's OG image. Idempotent.
 *
 *   node scripts/make-covers.mjs [--force]
 *
 * Needs `sharp` (devDependency). Newsreader ships as scripts/fonts/ (OFL).
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content", "library");
const FONT = path.join(ROOT, "scripts", "fonts", "Newsreader[opsz,wght].ttf");
const FORCE = process.argv.includes("--force");
const WIDTH = 1200;
const HEIGHT = 675;
const MARGIN = 96;

/** Gradient stops per category: maroon only, slightly different depth each (DESIGN-BRIEF §2). */
const GRADIENTS = {
  Deadlines: ["#7A0A4A", "#2B0119"],
  "Trust Contests": ["#66043D", "#2B0119"],
  "Will Contests": ["#5E0838", "#22010F"],
  "Undue Influence & Capacity": ["#52032F", "#1A010B"],
  "Trustees & Fiduciaries": ["#6E0F48", "#2B0119"],
  "Elder Financial Abuse": ["#5A0A3C", "#1E0111"],
  "Probate Process": ["#4A0A33", "#2B0119"],
  "For Trustees": ["#620C42", "#22010F"],
  "Complex Estates": ["#4E0630", "#1E0111"],
  "Business Disputes": ["#560E3E", "#1A010B"],
  "Technology & the Law": ["#3F0226", "#140108"],
};

function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) throw new Error("missing frontmatter");
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    meta[line.slice(0, sep).trim()] = line
      .slice(sep + 1)
      .trim()
      .replace(/^"(.*)"$/, "$1");
  }
  return meta;
}

function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function background(category) {
  const [from, to] = GRADIENTS[category] ?? GRADIENTS["Trust Contests"];
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
    `<span letter_spacing="4096">${white(article.category.toUpperCase(), "C0")}</span>`,
    "Newsreader Medium",
    WIDTH - MARGIN * 2,
    60,
    [22],
  );
  const title = await textLayer(white(article.title, "FF"), "Newsreader Medium", 1000, 330, [64, 56, 48, 42, 36]);
  const mark = await textLayer(white("Rothrock Legal · Library", "CC"), "Newsreader", 600, 60, [24]);
  await sharp(background(article.category))
    .composite([
      { input: eyebrow.data, left: MARGIN, top: 150 },
      { input: title.data, left: MARGIN - 2, top: 232 },
      { input: mark.data, left: MARGIN, top: HEIGHT - 72 },
    ])
    .webp({ quality: 84 })
    .toFile(outFile);
}

async function main() {
  if (!fs.existsSync(FONT)) throw new Error(`Font missing: ${FONT}`);
  const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith(".md"));
  let made = 0;
  let skipped = 0;
  for (const file of files) {
    const meta = parseFrontmatter(fs.readFileSync(path.join(CONTENT, file), "utf8"));
    if (!meta.image?.startsWith("/images/library/")) {
      skipped += 1;
      continue;
    }
    const outFile = path.join(ROOT, "public", meta.image);
    if (fs.existsSync(outFile) && !FORCE) {
      skipped += 1;
      continue;
    }
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    await makeCover({ title: meta.title, category: meta.category }, outFile);
    const size = Math.round(fs.statSync(outFile).size / 1024);
    console.log(`made ${meta.image} (${size} KB)`);
    made += 1;
  }
  console.log(`make-covers: ${made} generated, ${skipped} already present or using their own image, ${files.length} articles`);
}

main().catch((error) => {
  console.error(`make-covers failed: ${error.message}`);
  process.exit(1);
});
