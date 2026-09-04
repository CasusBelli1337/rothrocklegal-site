import { describe, expect, it } from 'vitest';
import limits from '@/config/seo-limits.json';
import {
  FEATURED_SLUG,
  TECH_CATEGORY,
  getArticle,
  getArticles,
  getCategoriesWithCounts,
  getFeatured,
  getRelated,
} from './articles';

/** Integration tests over the real content/library/ tree. */
describe('library loader', () => {
  const articles = getArticles();

  it('loads every article newest first with the schema fields filled', () => {
    expect(articles.length).toBeGreaterThanOrEqual(20);
    for (let i = 1; i < articles.length; i += 1) {
      expect(articles[i - 1].date >= articles[i].date).toBe(true);
    }
    for (const a of articles) {
      expect(a.slug).toMatch(/^[a-z0-9-]+$/);
      expect(a.description.length).toBeLessThanOrEqual(limits.descriptionMax);
      expect(a.tags.length).toBeGreaterThan(0);
      expect(a.readTime).toBeGreaterThanOrEqual(1);
      expect(a.bodyHtml).toContain('<p>');
      expect(`${a.bodyHtml}${a.outroHtml}`).toContain('class="disclaimer"');
    }
  });

  it('spreads publish dates across 2022 to 2026 and never updates before publishing', () => {
    const years = new Set(articles.map((a) => a.date.slice(0, 4)));
    expect([...years].sort()).toEqual(['2022', '2023', '2024', '2025', '2026']);
    expect(articles[0].slug).toBe(FEATURED_SLUG);
    for (const a of articles) expect(a.updated >= a.date).toBe(true);
  });

  it('sorts Technology & the Law after other articles published the same day', () => {
    for (let i = 1; i < articles.length; i += 1) {
      const [prev, next] = [articles[i - 1], articles[i]];
      if (prev.date === next.date && prev.category === TECH_CATEGORY) {
        expect(next.category).toBe(TECH_CATEGORY);
      }
    }
  });

  it('retired the nine legacy posts: no old Wix slugs, the glossary alone in Technology & the Law', () => {
    const tech = articles.filter((a) => a.category === TECH_CATEGORY);
    expect(tech.map((a) => a.slug)).toEqual(['ai-glossary']);
  });

  it('splits the anchor article into body, FAQ, and outro', () => {
    const anchor = getArticle(FEATURED_SLUG);
    expect(anchor.faq.length).toBeGreaterThanOrEqual(5);
    expect(anchor.faqHeading?.id).toBe('frequently-asked-questions');
    expect(anchor.bodyHtml).not.toContain(anchor.faq[0].question);
    expect(anchor.bodyHtml).toContain('<div class="table-wrap" tabindex="0">');
    expect(anchor.outroHtml).toMatch(/^<h2 id="talk-to-a-trust-litigation-lawyer-in-san-jose">/);
    expect(anchor.outroHtml).toContain('<p class="disclaimer">');
    expect(anchor.toc.filter((h) => h.level === 2).length).toBeGreaterThanOrEqual(4);
    expect(anchor.bodyText).not.toContain('attorney-client relationship');
  });

  it('excludes drafts on request', () => {
    const published = getArticles({ includeDrafts: false });
    expect(published.every((a) => !a.draft)).toBe(true);
    expect(published.length).toBe(articles.filter((a) => !a.draft).length);
  });

  // Arthur, 2026-09-03: section headings are the questions people search for.
  it('writes every section heading as a question, apart from the FAQ heading', () => {
    for (const a of articles) {
      const fixed = ['frequently-asked-questions', 'talk-to-a-trust-litigation-lawyer-in-san-jose'];
      const sections = a.toc.filter((h) => h.level === 2 && !fixed.includes(h.id));
      for (const h of sections) expect(`${a.slug}: ${h.text}`).toMatch(/\?$/);
    }
  });

  it('features the anchor deadlines article', () => {
    expect(getFeatured()?.slug).toBe(FEATURED_SLUG);
  });

  it('relates trust articles to trust articles and leaves the lone tech post unrelated', () => {
    const anchor = getArticle(FEATURED_SLUG);
    const related = getRelated(anchor, 3);
    expect(related).toHaveLength(3);
    expect(related.every((a) => a.category !== TECH_CATEGORY && a.slug !== anchor.slug)).toBe(true);
    // Technology & the Law only relates to itself, and the glossary is its only member.
    expect(getRelated(getArticle('ai-glossary'), 3)).toHaveLength(0);
  });

  it('counts every category, zero included, in LIBRARY_CATEGORIES order', () => {
    const counts = getCategoriesWithCounts();
    expect(counts).toHaveLength(11);
    expect(counts[0].category).toBe('Deadlines');
    expect(counts.reduce((n, c) => n + c.count, 0)).toBe(articles.length);
    expect(counts.find((c) => c.category === TECH_CATEGORY)?.count).toBe(1);
    // The practice-page categories exist before any article is filed under them.
    expect(counts.find((c) => c.category === 'For Trustees')?.slug).toBe('for-trustees');
    expect(counts.find((c) => c.category === 'Complex Estates')?.slug).toBe('complex-estates');
  });

  it('throws for an unknown slug', () => {
    expect(() => getArticle('nope')).toThrow(/No library article/);
  });
});
