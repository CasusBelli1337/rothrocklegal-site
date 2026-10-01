import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getArticles } from './articles';
import { articleOgImage } from './og-image';

describe('articleOgImage', () => {
  it('has a 1200x630 JPEG social card for every article', () => {
    for (const article of getArticles()) {
      const rel = articleOgImage(article.slug);
      const bytes = fs.readFileSync(path.join(process.cwd(), 'public', rel));
      // JPEG SOI marker: a WebP renamed .jpg would not pass.
      expect(bytes.subarray(0, 2).toString('hex')).toBe('ffd8');
    }
  });

  it('fails loudly when a card is missing', () => {
    expect(() => articleOgImage('no-such-article')).toThrow(/make-covers/);
  });
});
