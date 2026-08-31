import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-static';

const staticPaths = [
  '/',
  '/about/',
  '/faq/',
  '/contact/',
  '/news-and-events/',
  '/for-lawyers-by-lawyers/',
  '/ip-considerations/',
  '/ai-glossary/',
  '/privacy-policy/',
  '/disclaimer/',
];

/** The old Wix site advertised a sitemap that 404'd — this one is real. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = staticPaths.map((path) => ({
    url: `${site.canonicalHost}${path}`,
    lastModified: new Date(),
  }));
  const posts = getAllPosts().map((post) => ({
    url: `${site.canonicalHost}/post/${post.slug}/`,
    lastModified: new Date(post.updated ?? post.date),
  }));
  return [...pages, ...posts];
}
