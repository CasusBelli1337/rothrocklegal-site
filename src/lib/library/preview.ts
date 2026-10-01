import { TECH_CATEGORY, getArticles } from '@/lib/library/articles';
import { toListItem, type LibraryListItem } from '@/lib/library/index-item';
import type { LibraryCategory } from '@/types/content';

/**
 * Light list items for previews (homepage "From the library", practice-page
 * "related reading", sitemap, llms.txt): frontmatter fields only, no body
 * HTML. Drafts follow `site.showDraftArticles` through getArticles().
 */

/** Every library item, newest first. */
export function getLibraryItems(): LibraryListItem[] {
  return getArticles().map(toListItem);
}

export interface PreviewOptions {
  /** Only these categories (any of). */
  categories?: readonly LibraryCategory[];
  /** Slugs moved to the front, in this order, when they are in the pool. */
  pinned?: readonly string[];
  /** Slugs shown first whatever their category (a practice page's `featuredArticles`). */
  featured?: readonly string[];
}

/** Newest items outside Technology & the Law (LIBRARY-SPEC §8), optionally limited to categories. */
export function getLibraryPreview(limit: number, options: PreviewOptions = {}): LibraryListItem[] {
  const all = getLibraryItems().filter((item) => item.category !== TECH_CATEGORY);
  const pool = all.filter(
    (item) => !options.categories || options.categories.includes(item.category),
  );
  const find = (from: LibraryListItem[]) => (slug: string) =>
    from.find((item) => item.slug === slug);
  const front = [
    ...(options.featured ?? []).map(find(all)),
    ...(options.pinned ?? []).map(find(pool)),
  ].filter((item): item is LibraryListItem => item !== undefined);
  const first = [...new Set(front)];
  return [...first, ...pool.filter((item) => !first.includes(item))].slice(0, limit);
}
