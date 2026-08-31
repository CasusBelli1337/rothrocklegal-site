import fs from 'node:fs';
import path from 'node:path';

export interface GlossaryEntry {
  term: string;
  definition: string;
}

/**
 * Loads the AI terminology glossary from content/glossary.md.
 * One entry per paragraph, "Term: definition" form.
 * Count-verified: throws if entries are lost (guards against silent truncation).
 */
export function getGlossary(): GlossaryEntry[] {
  const source = fs.readFileSync(path.join(process.cwd(), 'content', 'glossary.md'), 'utf8');
  const paragraphs = source
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p !== '');
  const entries = paragraphs.map((paragraph) => {
    const sep = paragraph.indexOf(': ');
    if (sep === -1) throw new Error(`Glossary entry without "Term: definition" form: ${paragraph}`);
    return { term: paragraph.slice(0, sep), definition: paragraph.slice(sep + 2) };
  });
  if (entries.length < 80) {
    throw new Error(`Glossary suspiciously short (${entries.length} entries) — check content/glossary.md`);
  }
  return entries;
}
