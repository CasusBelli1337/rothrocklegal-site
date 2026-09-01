import fs from 'node:fs';
import path from 'node:path';
import { renderMarkdown } from '@/lib/markdown';
import { categorySlug } from '@/types/content';

/**
 * Practice-page body copy lives in content/practice/<slug>.md as `## ` sections
 * (CONTRACTS §3). Each section is rendered with the shared markdown renderer.
 */

export interface PracticeSection {
  id: string;
  heading: string;
  html: string;
}

const PRACTICE_DIR = path.join(process.cwd(), 'content', 'practice');
const MIN_SECTIONS = 3;

export function getPracticeBody(slug: string): PracticeSection[] {
  const file = path.join(PRACTICE_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) throw new Error(`Missing practice body content/practice/${slug}.md`);
  const source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const chunks = source.split(/^## /m).filter((chunk) => chunk.trim() !== '');
  const seen = new Set<string>();
  const sections = chunks.map((chunk) => {
    const newline = chunk.indexOf('\n');
    const heading = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
    const body = newline === -1 ? '' : chunk.slice(newline + 1).trim();
    if (!heading || !body) throw new Error(`Empty section in content/practice/${slug}.md`);
    let id = categorySlug(heading);
    while (seen.has(id)) id = `${id}-2`;
    seen.add(id);
    return { id, heading, html: renderMarkdown(body) };
  });
  if (sections.length < MIN_SECTIONS) {
    throw new Error(
      `content/practice/${slug}.md has ${sections.length} sections; expected at least ${MIN_SECTIONS}`,
    );
  }
  return sections;
}
