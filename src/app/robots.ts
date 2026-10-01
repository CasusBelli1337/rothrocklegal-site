import type { MetadataRoute } from 'next';
import { AI_CRAWLERS } from '@/config/crawlers';
import { site } from '@/config/site';
import { PUBLIC_LINK_PATHS } from '@/lib/public/paths';

export const dynamic = 'force-static';

/** Never crawled by anyone: the search index file and the two emailed-link pages. */
export const PRIVATE_PATHS = ['/library/index.json', ...PUBLIC_LINK_PATHS];

/**
 * AI answer engines are allowed explicitly (SEO-SPEC §6, src/config/crawlers.ts). They
 * share one group that repeats the private paths: a crawler named in its own group
 * ignores the `*` group, so an allow-only group would open /sign/ and /schedule/ to it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: [...AI_CRAWLERS], allow: '/', disallow: PRIVATE_PATHS },
    ],
    sitemap: `${site.canonicalHost}/sitemap.xml`,
  };
}
