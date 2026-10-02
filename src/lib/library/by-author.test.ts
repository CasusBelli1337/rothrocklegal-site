import { describe, expect, it } from 'vitest';
import { getTeamMember } from '@/config/team';
import { getArticles, TECH_CATEGORY } from './articles';
import { articlesByMember, elsewhereByMember, MAX_ELSEWHERE } from './by-author';

/** Integration tests over the real content/library/ tree and Arthur's config. */
describe('articlesByMember', () => {
  const arthur = getTeamMember('arthur-rothrock');
  const listed = articlesByMember(arthur);

  it('lists every published article by the member and nothing else', () => {
    const own = getArticles({ includeDrafts: false }).filter((a) => a.author === arthur.slug);
    expect(listed).toHaveLength(own.length);
    expect(new Set(listed.map((a) => a.slug))).toEqual(new Set(own.map((a) => a.slug)));
    expect(listed.every((a) => !a.draft && a.author === arthur.slug)).toBe(true);
  });

  it('puts the configured articles first, in order, then the rest newest first', () => {
    const featured = arthur.writing?.featuredArticles ?? [];
    expect(featured.length).toBeGreaterThanOrEqual(6);
    expect(listed.slice(0, featured.length).map((a) => a.slug)).toEqual(featured);
    expect(listed[0].category).toBe('Deadlines');
    const rest = listed.slice(featured.length).filter((a) => a.category !== TECH_CATEGORY);
    for (let i = 1; i < rest.length; i += 1)
      expect(rest[i - 1].date >= rest[i].date, rest[i].slug).toBe(true);
  });

  it('keeps Technology & the Law at the very end, out of the rows the bio shows', () => {
    const shown = listed.slice(0, arthur.writing?.shown ?? 0);
    expect(shown.some((a) => a.category === TECH_CATEGORY)).toBe(false);
    const firstTech = listed.findIndex((a) => a.category === TECH_CATEGORY);
    expect(listed.slice(firstTech).every((a) => a.category === TECH_CATEGORY)).toBe(true);
  });

  it('fails loudly on a featured slug that is not theirs', () => {
    const writing = { featuredArticles: ['no-such-article'], shown: 1, elsewhere: [] };
    expect(() => articlesByMember({ slug: arthur.slug, writing })).toThrow(/no-such-article/);
    expect(() => articlesByMember({ slug: 'gerry-lin', writing: arthur.writing })).toThrow(
      /not a published article by them/,
    );
  });

  it('lists nothing for a member with no articles', () => {
    expect(articlesByMember(getTeamMember('max-discher'))).toEqual([]);
  });
});

describe('elsewhereByMember', () => {
  it('returns at most six external articles, newest first, on https', () => {
    const items = elsewhereByMember(getTeamMember('arthur-rothrock'));
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(MAX_ELSEWHERE);
    for (let i = 1; i < items.length; i += 1)
      expect(items[i - 1].published >= items[i].published).toBe(true);
    for (const item of items) {
      expect(item.url).toMatch(/^https:\/\//);
      expect(item.title).not.toContain('—');
    }
  });
});
