import { getArticles, type LibraryArticle } from '@/lib/library/articles';
import type { LibraryCategory } from '@/types/content';

/**
 * Lightweight library view for previews (homepage "From the library",
 * practice-page "related reading"): frontmatter fields only, no body HTML,
 * so a page that lists three cards does not serialize three articles.
 */

export type LibraryPreviewItem = Pick<
  LibraryArticle,
  | 'slug'
  | 'title'
  | 'excerpt'
  | 'category'
  | 'categorySlug'
  | 'date'
  | 'updated'
  | 'image'
  | 'imageAlt'
  | 'draft'
> & {
  /** Minutes, words / 200, min 1. */
  readingTime: number;
};

export function toPreviewItem(article: LibraryArticle): LibraryPreviewItem {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    categorySlug: article.categorySlug,
    date: article.date,
    updated: article.updated,
    image: article.image,
    imageAlt: article.imageAlt,
    draft: article.draft,
    readingTime: article.readTime,
  };
}

/** Every library item, newest first. */
export function getLibraryItems(): LibraryPreviewItem[] {
  return getArticles().map(toPreviewItem);
}

export interface PreviewOptions {
  /** Only these categories (any of). */
  categories?: readonly LibraryCategory[];
  /** Never these categories. Defaults to Technology & the Law (LIBRARY-SPEC §8). */
  exclude?: readonly LibraryCategory[];
  /** Include `draft: true` items (they carry the draft chip). Default true until Arthur clears them. */
  includeDrafts?: boolean;
}

export function getLibraryPreview(
  limit: number,
  options: PreviewOptions = {},
): LibraryPreviewItem[] {
  const exclude = options.exclude ?? ['Technology & the Law'];
  const includeDrafts = options.includeDrafts ?? true;
  return getLibraryItems()
    .filter((item) => includeDrafts || !item.draft)
    .filter((item) => !exclude.includes(item.category))
    .filter((item) => !options.categories || options.categories.includes(item.category))
    .slice(0, limit);
}
