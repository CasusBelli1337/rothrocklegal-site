import type { TeamMember, TeamExternalArticle } from '@/config/team';
import { getArticles, TECH_CATEGORY, type LibraryArticle } from '@/lib/library/articles';
import { byNewest } from '@/lib/library/dates';

/**
 * The bio page's writing lists (components/team/ArticlesByMember), derived
 * from the article index by author: the member's `writing.featuredArticles`
 * first in their configured order, then the rest newest first, with
 * Technology & the Law last (it is never featured or previewed). Drafts are
 * never listed. A featured slug that is missing, a draft, or someone else's
 * throws, so a renamed article fails the build instead of quietly dropping.
 */

export const MAX_ELSEWHERE = 6;

export function articlesByMember(member: Pick<TeamMember, 'slug' | 'writing'>): LibraryArticle[] {
  const own = getArticles({ includeDrafts: false }).filter((a) => a.author === member.slug);
  const featured = (member.writing?.featuredArticles ?? []).map((slug) => {
    const article = own.find((a) => a.slug === slug);
    if (!article)
      throw new Error(
        `team/${member.slug}: featured article "${slug}" is not a published article by them`,
      );
    return article;
  });
  const isTech = (a: LibraryArticle) => Number(a.category === TECH_CATEGORY);
  const rest = own
    .filter((a) => !featured.includes(a))
    .sort((a, b) => isTech(a) - isTech(b) || byNewest(a, b));
  return [...featured, ...rest];
}

/** The "Elsewhere" list: at most six, newest first. */
export function elsewhereByMember(
  member: Pick<TeamMember, 'slug' | 'writing'>,
): TeamExternalArticle[] {
  const items = [...(member.writing?.elsewhere ?? [])];
  if (items.length > MAX_ELSEWHERE)
    throw new Error(
      `team/${member.slug}: ${items.length} elsewhere articles, max ${MAX_ELSEWHERE}`,
    );
  return items.sort((a, b) => b.published.localeCompare(a.published));
}
