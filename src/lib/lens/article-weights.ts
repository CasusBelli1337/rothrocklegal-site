import { lensConfig } from '@/config/lens';
import { getArticles } from '@/lib/library/articles';

/**
 * slug → landing weight for every article whose category carries one, read
 * from the article index at export time (server only) and handed to
 * LensTracker so the browser never fetches anything to classify a path.
 */
export function articleLensWeights(): Record<string, number> {
  const entries = getArticles()
    .map((article) => [article.slug, lensConfig.categoryWeights[article.category]] as const)
    .filter(([, weight]) => weight !== 0);
  return Object.fromEntries(entries);
}
