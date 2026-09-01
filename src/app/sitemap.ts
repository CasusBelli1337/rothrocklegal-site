import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { getArticles } from '@/lib/library/articles';

export const dynamic = 'force-static';

const staticPaths = [
  '/',
  '/about/',
  '/faq/',
  '/contact/',
  '/how-long-do-i-have/',
  '/library/',
  '/for-lawyers-by-lawyers/',
  '/privacy-policy/',
  '/disclaimer/',
];

/** Indexable URLs only: drafts and redirect stubs stay out (SEO-SPEC §6). */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = staticPaths.map((path) => ({
    url: `${site.canonicalHost}${path}`,
    lastModified: site.lastUpdated,
  }));
  const articles = getArticles({ includeDrafts: false }).map((article) => ({
    url: `${site.canonicalHost}/library/${article.slug}/`,
    lastModified: article.updated,
  }));
  console.log(`sitemap: ${pages.length} pages + ${articles.length} published articles`);
  return [...pages, ...articles];
}
