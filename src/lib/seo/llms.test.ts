import { describe, expect, it } from 'vitest';
import { practiceAreas } from '@/config/practice-areas';
import { getArticles } from '@/lib/library/articles';
import { absoluteLinks, buildLlmsFullTxt, buildLlmsTxt } from './llms';

const published = getArticles({ includeDrafts: false });
const drafts = getArticles({ includeDrafts: true }).filter((a) => a.draft);

describe('llms.txt', () => {
  const text = buildLlmsTxt();

  it('says what the firm is, where, and how to reach it', () => {
    expect(text).toMatch(/^# Rothrock Legal\n> Rothrock Legal is a trust and estate litigation law firm in San Jose, California/);
    expect(text).toContain('https://www.rothrocklegal.com/request-a-consult/');
    expect(text).toContain('https://www.rothrocklegal.com/llms-full.txt');
    expect(text).not.toMatch(/\(?\d{3}\)?[ .-]\d{3}-\d{4}/);
  });

  it('lists every published article and every practice page, and no draft', () => {
    for (const a of published) expect(text).toContain(`/library/${a.slug}/`);
    for (const a of drafts) expect(text).not.toContain(`/library/${a.slug}/`);
    for (const p of practiceAreas) expect(text).toContain(`/${p.slug}/`);
  });
});

describe('llms-full.txt', () => {
  const text = buildLlmsFullTxt();

  it('carries one document per practice page and published article', () => {
    expect(text.match(/^URL: /gm)).toHaveLength(practiceAreas.length + published.length);
  });

  // Articles may quote a public hotline (Adult Protective Services); the firm's own number never appears.
  it('has no relative links, em dashes, placeholders, or firm phone number', () => {
    expect(text).not.toMatch(/\]\(\//);
    expect(text).not.toContain('\u2014');
    expect(text).not.toContain('[CONFIRM]');
    expect(text).not.toContain('420-7034');
  });
});

describe('absoluteLinks', () => {
  it('points site-relative links at the canonical host and leaves others alone', () => {
    expect(absoluteLinks('[a](/trust-contests/) [b](https://example.com/)')).toBe(
      '[a](https://www.rothrocklegal.com/trust-contests/) [b](https://example.com/)',
    );
  });
});
