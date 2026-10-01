import type { PracticeArea } from '@/config/practice-areas';
import type { TeamMember } from '@/config/team';
import type { Crumb, FaqItem } from '@/types/content';
import {
  ORG_ID,
  WEBSITE_ID,
  absoluteUrl,
  personRef,
  withContext,
  type JsonLdObject,
} from './jsonld-core';

/** Page-level JSON-LD builders (SEO-SPEC §3d–§3f). Import them from `@/lib/seo/jsonld`. */

export interface ArticleInput {
  slug: string;
  title: string;
  description: string;
  /** Site-relative 16:9 cover, the article's own image. */
  image?: string;
  /** ISO dates. */
  date: string;
  updated: string;
  author: Pick<TeamMember, 'slug' | 'name'>;
  category: string;
  tags: readonly string[];
  /** Body words (the loader's count), shown to readers as the read time. */
  wordCount?: number;
  /** BlogPosting for the Technology & the Law posts (SEO-SPEC §3d). */
  legacy?: boolean;
  /** Site-relative fallback when the article has no cover. */
  fallbackImage: string;
}

export function article(input: ArticleInput): JsonLdObject {
  const url = absoluteUrl(`/library/${input.slug}/`);
  return withContext({
    '@type': input.legacy ? 'BlogPosting' : 'Article',
    '@id': `${url}#article`,
    headline: input.title.slice(0, 110),
    description: input.description,
    image: [absoluteUrl(input.image ?? input.fallbackImage)],
    datePublished: `${input.date}T00:00:00-07:00`,
    dateModified: `${input.updated}T00:00:00-07:00`,
    author: personRef(input.author),
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@id': WEBSITE_ID },
    articleSection: input.category,
    wordCount: input.wordCount,
    about: [{ '@type': 'Thing', name: input.category }],
    keywords: input.tags.join(', '),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  });
}

export function faqPage(items: readonly FaqItem[]): JsonLdObject {
  return withContext({
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });
}

/** Trail per IA.md §6; the last crumb has no href. */
export function breadcrumbList(trail: readonly Crumb[]): JsonLdObject {
  return withContext({
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      item: crumb.href ? absoluteUrl(crumb.href) : undefined,
    })),
  });
}

export interface WebPageInput {
  path: string;
  title: string;
  description: string;
  updated?: string;
  /** The page's visible byline, when it has one. */
  author?: Pick<TeamMember, 'slug' | 'name'>;
  /** What the page is about; the firm when omitted. */
  about?: JsonLdObject;
}

function webPageNode(input: WebPageInput): JsonLdObject {
  return {
    '@type': 'WebPage',
    '@id': absoluteUrl(input.path),
    url: absoluteUrl(input.path),
    name: input.title,
    description: input.description,
    dateModified: input.updated,
    author: input.author ? personRef(input.author) : undefined,
    isPartOf: { '@id': WEBSITE_ID },
    about: input.about ?? { '@id': ORG_ID },
    inLanguage: 'en-US',
  };
}

export function webPage(input: WebPageInput): JsonLdObject {
  return withContext(webPageNode(input));
}

/**
 * A practice page: the WebPage (byline and "Updated" date as shown) and the legal
 * service it describes, provided by the firm. Semantic only; Google shows no rich
 * result for Service, but answer engines read what the firm handles from it.
 */
export function practicePage(
  area: PracticeArea,
  path: string,
  author: Pick<TeamMember, 'slug' | 'name'>,
): JsonLdObject {
  const serviceId = `${absoluteUrl(path)}#service`;
  const service: JsonLdObject = {
    '@type': 'Service',
    '@id': serviceId,
    name: area.title,
    serviceType: area.topic,
    description: area.description,
    url: absoluteUrl(path),
    provider: { '@id': ORG_ID },
  };
  const page = webPageNode({
    path,
    title: area.seoTitle,
    description: area.description,
    updated: area.updatedAt,
    author,
    about: { '@id': serviceId },
  });
  return withContext({ '@graph': [{ ...page, mainEntity: { '@id': serviceId } }, service] });
}

export interface CollectionItem {
  /** Site-relative URL. */
  path: string;
  name: string;
}

/** An index page (the attorneys, the library) and the list of what it links to. */
export function collectionPage(
  input: Omit<WebPageInput, 'author' | 'about'> & { items: readonly CollectionItem[] },
): JsonLdObject {
  const { items, ...page } = input;
  return withContext({
    ...webPageNode(page),
    '@type': 'CollectionPage',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  });
}
