import type { MetadataRoute } from 'next';
import { practiceAreas, practiceHref } from '@/config/practice-areas';
import { site } from '@/config/site';
import { hasPlaceholders, team, teamHref } from '@/config/team';
import { getLibraryItems } from '@/lib/library/preview';

export const dynamic = 'force-static';

/** Static pages with the date of their last substantive edit (SEO-SPEC §6); `draft` pages render noindex. */
const staticPages: { path: string; updated: string; draft?: boolean }[] = [
  { path: '/', updated: site.lastUpdated },
  { path: '/how-long-do-i-have/', updated: site.lastUpdated },
  { path: '/attorneys/', updated: site.lastUpdated },
  { path: '/about/', updated: site.lastUpdated },
  { path: '/library/', updated: site.lastUpdated },
  { path: '/faq/', updated: site.lastUpdated },
  { path: '/service-areas/', updated: site.lastUpdated },
  { path: '/contact/', updated: site.lastUpdated },
  { path: '/request-a-consult/', updated: site.lastUpdated },
  { path: '/privacy-policy/', updated: site.lastUpdated, draft: site.legalPagesDraft },
  { path: '/disclaimer/', updated: site.lastUpdated, draft: site.legalPagesDraft },
];

function entry(path: string, updated: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${site.canonicalHost}${path}`,
    lastModified: new Date(`${updated}T00:00:00-07:00`),
  };
}

/** Every indexable URL; drafts (articles, legal pages), unverified bios, stubs, thank-you, and index.json are excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = staticPages.filter((p) => !p.draft).map((p) => entry(p.path, p.updated));
  const practice = practiceAreas.map((a) => entry(practiceHref(a), a.updatedAt));
  const attorneys = team
    .filter((m) => !hasPlaceholders(m))
    .map((m) => entry(teamHref(m), m.updatedAt));
  const articles = getLibraryItems()
    .filter((item) => !item.draft)
    .map((item) => entry(`/library/${item.slug}/`, item.updated));
  const all = [...pages, ...practice, ...attorneys, ...articles];
  console.log(
    `sitemap: ${all.length} urls (${pages.length} static, ${practice.length} practice, ${attorneys.length} attorneys, ${articles.length} articles)`,
  );
  return all;
}
