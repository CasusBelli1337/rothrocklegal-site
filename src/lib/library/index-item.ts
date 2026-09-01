import type { LibraryArticle } from '@/lib/library/articles';

/**
 * The two client-facing shapes of an article: the light list item the index
 * page serializes for its cards, and the search-index item (list item +
 * body text) served from /library/index.json.
 */

export type LibraryListItem = Pick<
  LibraryArticle,
  | 'slug'
  | 'title'
  | 'excerpt'
  | 'category'
  | 'categorySlug'
  | 'tags'
  | 'date'
  | 'updated'
  | 'readTime'
  | 'draft'
  | 'image'
  | 'imageAlt'
>;

export type LibraryIndexItem = LibraryListItem & Pick<LibraryArticle, 'bodyText'>;

export function toListItem(article: LibraryArticle): LibraryListItem {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    categorySlug: article.categorySlug,
    tags: article.tags,
    date: article.date,
    updated: article.updated,
    readTime: article.readTime,
    draft: article.draft,
    image: article.image,
    imageAlt: article.imageAlt,
  };
}

export function toIndexItem(article: LibraryArticle): LibraryIndexItem {
  return { ...toListItem(article), bodyText: article.bodyText };
}
