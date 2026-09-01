import { getArticles } from '@/lib/library/articles';
import { toIndexItem } from '@/lib/library/index-item';

/**
 * Build-time search index (LIBRARY-SPEC §5): exported as out/library/index.json
 * and fetched by LibraryClient on the first keystroke. Count-verified so a
 * loader regression can never ship an empty index.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  const articles = getArticles();
  const items = articles.map(toIndexItem);
  if (items.length === 0 || items.length !== articles.length) {
    throw new Error(`library index: ${items.length} items for ${articles.length} articles`);
  }
  console.log(`library index: ${items.length} items`);
  return Response.json(items);
}
