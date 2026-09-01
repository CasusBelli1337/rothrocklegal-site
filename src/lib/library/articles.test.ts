import { describe, expect, it } from 'vitest';
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
    expect(articles.length).toBeGreaterThanOrEqual(19);
    for (let i = 1; i < articles.length; i += 1) {
      expect(articles[i - 1].date >= articles[i].date).toBe(true);
    }
    for (const a of articles) {
      expect(a.slug).toMatch(/^[a-z0-9-]+$/);
      expect(a.description.length).toBeLessThanOrEqual(160);
      expect(a.tags.length).toBeGreaterThan(0);
      expect(a.readTime).toBeGreaterThanOrEqual(1);
      expect(a.bodyHtml).toContain('<p>');
      expect(`${a.bodyHtml}${a.outroHtml}`).toContain('class="disclaimer"');
    }
  });

  it('sorts Technology & the Law after other articles published the same day', () => {
    for (let i = 1; i < articles.length; i += 1) {
      const [prev, next] = [articles[i - 1], articles[i]];
      if (prev.date === next.date && prev.category === TECH_CATEGORY) {
        expect(next.category).toBe(TECH_CATEGORY);
      }
    }
  });

  it('keeps the nine legacy posts with their old Wix slugs', () => {
    const legacy = articles.filter((a) => a.oldSlug);
    expect(legacy).toHaveLength(9);
    expect(legacy.every((a) => a.category === TECH_CATEGORY)).toBe(true);
  });

  it('splits the anchor article into body, FAQ, and outro', () => {
    const anchor = getArticle(FEATURED_SLUG);
    expect(anchor.faq.length).toBeGreaterThanOrEqual(5);
    expect(anchor.faqHeading?.id).toBe('frequently-asked-questions');
    expect(anchor.bodyHtml).not.toContain(anchor.faq[0].question);
    expect(anchor.bodyHtml).toContain('<div class="table-wrap">');
    expect(anchor.outroHtml).toMatch(/^<h2 id="talk-to-a-trust-litigation-lawyer-in-san-jose">/);
    expect(anchor.outroHtml).toContain('<p class="disclaimer">');
    expect(anchor.toc.map((h) => h.id)).toContain('key-deadlines');
    expect(anchor.bodyText).not.toContain('attorney-client relationship');
  });

  it('excludes drafts on request', () => {
    const published = getArticles({ includeDrafts: false });
    expect(published.every((a) => !a.draft)).toBe(true);
    expect(published.length).toBeLessThan(articles.length);
  });

  it('features the anchor deadlines article', () => {
    expect(getFeatured()?.slug).toBe(FEATURED_SLUG);
  });

  it('relates trust articles to trust articles and tech posts to tech posts', () => {
    const anchor = getArticle(FEATURED_SLUG);
    const related = getRelated(anchor, 3);
    expect(related).toHaveLength(3);
    expect(related.every((a) => a.category !== TECH_CATEGORY && a.slug !== anchor.slug)).toBe(true);
    const tech = getArticle('what-is-ai');
    const techRelated = getRelated(tech, 3);
    expect(techRelated.every((a) => a.category === TECH_CATEGORY)).toBe(true);
  });

  it('counts every category, zero included, in CONTRACTS order', () => {
    const counts = getCategoriesWithCounts();
    expect(counts).toHaveLength(9);
    expect(counts[0].category).toBe('Deadlines');
    expect(counts.reduce((n, c) => n + c.count, 0)).toBe(articles.length);
    expect(counts.find((c) => c.category === TECH_CATEGORY)?.count).toBe(10);
  });

  it('throws for an unknown slug', () => {
    expect(() => getArticle('nope')).toThrow(/No library article/);
  });
});
