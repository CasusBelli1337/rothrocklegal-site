import { describe, expect, it } from 'vitest';
import { getPracticeArea, practiceAreas } from '@/config/practice-areas';
import { getArticles } from './articles';
import { getLibraryPreview } from './preview';

describe('getLibraryPreview', () => {
  it('puts a featured article first even when it is filed in another category', () => {
    const area = getPracticeArea('estate-property-disputes');
    const items = getLibraryPreview(4, {
      categories: area.categories,
      featured: area.featuredArticles,
    });
    expect(items[0]?.slug).toBe('what-is-a-heggstad-petition-california');
    expect(items).toHaveLength(4);
    expect(new Set(items.map((i) => i.slug)).size).toBe(items.length);
  });

  it('keeps pinned slugs limited to the categories asked for (the homepage lens previews)', () => {
    const items = getLibraryPreview(3, {
      categories: ['Deadlines'],
      pinned: ['what-is-a-heggstad-petition-california'],
    });
    expect(items.map((i) => i.slug)).not.toContain('what-is-a-heggstad-petition-california');
  });

  it('features only articles that exist and are published', () => {
    const published = new Set(getArticles({ includeDrafts: false }).map((a) => a.slug));
    for (const area of practiceAreas) {
      for (const slug of area.featuredArticles ?? []) expect(published).toContain(slug);
    }
  });
});
