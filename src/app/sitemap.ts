import type { MetadataRoute } from 'next';
import { legal } from '@/components/legal/legal-constants';
import { practiceAreas, practiceHref } from '@/config/practice-areas';
import { site } from '@/config/site';
import { hasPlaceholders, team, teamHref } from '@/config/team';
import { getLibraryItems } from '@/lib/library/preview';

export const dynamic = 'force-static';

/** The later of two ISO dates (string order is date order for YYYY-MM-DD). */
const latest = (a: string, b: string) => (a > b ? a : b);

/**
 * Static pages with the date of their last substantive edit (SEO-SPEC §6); `draft` pages
 * render noindex. The legal pages use the date they print; the library index changes
 * whenever an article is published or revised.
 */
function staticPages(newestArticle: string): { path: string; updated: string; draft?: boolean }[] {
  return [
    { path: '/', updated: site.lastUpdated },
    { path: '/how-long-do-i-have/', updated: site.lastUpdated },
    { path: '/attorneys/', updated: site.lastUpdated },
    { path: '/about/', updated: site.lastUpdated },
    { path: '/library/', updated: latest(site.lastUpdated, newestArticle) },
    { path: '/faq/', updated: site.lastUpdated },
    { path: '/service-areas/', updated: site.lastUpdated },
    { path: '/contact/', updated: site.lastUpdated },
    { path: '/request-a-consult/', updated: site.lastUpdated },
    { path: '/accessibility/', updated: legal.effectiveDate },
    { path: '/privacy-policy/', updated: legal.privacyEffectiveDate, draft: site.legalPagesDraft },
    { path: '/disclaimer/', updated: legal.effectiveDate, draft: site.legalPagesDraft },
  ];
}

function entry(path: string, updated: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${site.canonicalHost}${path}`,
    lastModified: new Date(`${updated}T00:00:00-07:00`),
  };
}

/** Every indexable URL; drafts (articles, legal pages), unverified bios, stubs, and index.json are excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const published = getLibraryItems().filter((item) => !item.draft);
  const newestArticle = published.map((item) => item.updated).reduce(latest, '');
  const pages = staticPages(newestArticle)
    .filter((p) => !p.draft)
    .map((p) => entry(p.path, p.updated));
  const practice = practiceAreas.map((a) => entry(practiceHref(a), a.updatedAt));
  const attorneys = team
    .filter((m) => !hasPlaceholders(m))
    .map((m) => entry(teamHref(m), m.updatedAt));
  const articles = published.map((item) => entry(`/library/${item.slug}/`, item.updated));
  const all = [...pages, ...practice, ...attorneys, ...articles];
  console.log(
    `sitemap: ${all.length} urls (${pages.length} static, ${practice.length} practice, ${attorneys.length} attorneys, ${articles.length} articles)`,
  );
  return all;
}
