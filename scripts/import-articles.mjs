#!/usr/bin/env node
/**
 * Copies the writers' articles into content/library/ after validating each
 * one against the CONTRACTS §6 schema. Fails loudly: a bad file is reported
 * and the process exits non-zero, but every other file is still checked.
 *
 *   node scripts/import-articles.mjs [sourceDir]
 *   (default source: ~/projects/rothrock-legal/redesign/articles)
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE =
  process.argv[2] ??
  path.join(os.homedir(), "projects", "rothrock-legal", "redesign", "articles");
const DEST = path.join(ROOT, "content", "library");
const REQUIRED = [
  "title",
  "description",
  "excerpt",
  "date",
  "author",
  "category",
  "tags",
  "primaryKeyword",
  "image",
  "imageAlt",
  "draft",
];
const BANNED = /\b(leverage|harness|navigate|navigating|unlock|transform|journey|seamless|cutting-edge)\b|it['’]s important to note|it is important to note/i;
const DISCLAIMER_PREFIX = "This article is general information";

/** Reads the allowed values straight from the site config so the two can never drift. */
function configValues(file, pattern) {
  const source = fs.readFileSync(path.join(ROOT, file), "utf8");
  return [...source.matchAll(pattern)].map((m) => m[1]);
}
const TEAM = configValues("src/config/team.ts", /^\s+slug:\s*"([a-z-]+)"/gm);
const CATEGORIES = configValues(
  "src/types/content.ts",
  /^\s+"([A-Za-z& ]+)",$/gm,
);
if (TEAM.length === 0 || CATEGORIES.length === 0)
  throw new Error("Could not read team slugs or categories from src/");

function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) throw new Error("missing frontmatter");
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const sep = line.indexOf(":");
    if (sep === -1) throw new Error(`bad frontmatter line: ${line}`);
    meta[line.slice(0, sep).trim()] = line
      .slice(sep + 1)
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1");
  }
  return { meta, body: source.slice(match[0].length).trim() };
}

function validateMeta(slug, meta, errors) {
  for (const key of REQUIRED) if (!meta[key]) errors.push(`missing "${key}"`);
  if (meta.description && meta.description.length > 155)
    errors.push(`description is ${meta.description.length} chars (max 155)`);
  for (const key of ["date", "updated"])
    if (meta[key] && !/^\d{4}-\d{2}-\d{2}$/.test(meta[key]))
      errors.push(`"${key}" must be yyyy-mm-dd`);
  if (meta.author && !TEAM.includes(meta.author))
    errors.push(`author "${meta.author}" is not in src/config/team.ts`);
  if (meta.category && !CATEGORIES.includes(meta.category))
    errors.push(`category "${meta.category}" is not a library category`);
  if (meta.image && meta.image !== `/images/library/${slug}.webp`)
    errors.push(`image must be /images/library/${slug}.webp`);
  if (meta.draft && !["true", "false"].includes(meta.draft))
    errors.push(`draft must be true or false`);
}

function validateBody(body, errors) {
  if (/^# /m.test(body)) errors.push("body contains an H1; the title is the H1");
  const faq = /^## Frequently asked questions\s*$/m.exec(body);
  if (!faq) errors.push('missing "## Frequently asked questions" section');
  else if (!/^### .+\?$/m.test(body.slice(faq.index)))
    errors.push("FAQ section has no ### questions");
  if (!/^## Talk to a trust litigation lawyer in San Jose\s*$/m.test(body))
    errors.push('missing "## Talk to a trust litigation lawyer in San Jose" section');
  const last = body.split("\n").filter((l) => l.trim()).at(-1) ?? "";
  if (!last.startsWith(DISCLAIMER_PREFIX))
    errors.push(`last paragraph must be the disclaimer ("${DISCLAIMER_PREFIX}...")`);
}

function validate(slug, source) {
  const errors = [];
  if (source.includes("—")) errors.push("contains an em dash; use a spaced en dash");
  const banned = BANNED.exec(source);
  if (banned) errors.push(`banned word "${banned[0]}" (CONTRACTS §4)`);
  try {
    const { meta, body } = parseFrontmatter(source);
    validateMeta(slug, meta, errors);
    validateBody(body, errors);
  } catch (error) {
    errors.push(error.message);
  }
  return errors;
}

if (!fs.existsSync(SOURCE)) throw new Error(`Source directory not found: ${SOURCE}`);
fs.mkdirSync(DEST, { recursive: true });
const files = fs.readdirSync(SOURCE).filter((f) => f.endsWith(".md"));
const candidates = files.filter((f) => !f.endsWith("-VERIFICATION.md"));
const failures = [];
let imported = 0;

for (const file of candidates) {
  const slug = file.replace(/\.md$/, "");
  const source = fs.readFileSync(path.join(SOURCE, file), "utf8");
  const errors = validate(slug, source);
  if (errors.length > 0) {
    failures.push(`${file}\n    - ${errors.join("\n    - ")}`);
    continue;
  }
  fs.writeFileSync(path.join(DEST, file), source);
  imported += 1;
  console.log(`imported ${slug}`);
}

console.log(
  `import-articles: ${imported} imported, ${failures.length} failed, ` +
    `${files.length - candidates.length} verification files skipped (source: ${SOURCE})`,
);
if (failures.length > 0) {
  console.error(`\nFAILED:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
