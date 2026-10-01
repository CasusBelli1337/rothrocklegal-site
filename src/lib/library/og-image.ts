import fs from 'node:fs';
import path from 'node:path';

/**
 * An article's social card: the JPEG copy of its cover at 1200×630 that
 * scripts/make-covers.mjs writes (LinkedIn and some chat apps do not read WebP).
 * Throws at build when the card is missing, so a new article cannot ship with a
 * broken preview.
 */
export function articleOgImage(slug: string, publicDir = path.join(process.cwd(), 'public')): string {
  const rel = `/images/og/library/${slug}.jpg`;
  if (!fs.existsSync(path.join(publicDir, rel))) {
    throw new Error(`Missing ${rel}: run node scripts/make-covers.mjs`);
  }
  return rel;
}
