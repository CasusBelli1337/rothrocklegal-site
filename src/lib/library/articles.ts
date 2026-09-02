import fs from 'node:fs';
import path from 'node:path';
import limits from '@/config/seo-limits.json';
import { site } from '@/config/site';
import { getTeamMember } from '@/config/team';
import { parseBool, parseFrontmatter, parseList, requireKey } from '@/lib/frontmatter';
import { byNewest } from '@/lib/library/dates';
import { extractHeadings, renderMarkdown, stripMarkdown } from '@/lib/markdown';
import { FAQ_HEADING, extractFaq, searchableText, withoutFaqBody } from '@/lib/markdown-sections';
import {
  LIBRARY_CATEGORIES,
  categorySlug,
  isLibraryCategory,
  type FaqItem,
  type LibraryCategory,
} from '@/types/content';

/**
 * Library loader over content/library/*.md (CONTRACTS §6). Every schema
 * violation throws with the file name: a bad article fails the build rather
 * than silently vanishing from the index.
 */

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface LibraryArticle {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  updated: string;
  /** Key in src/config/team.ts. */
  author: string;
  category: LibraryCategory;
  categorySlug: string;
  tags: string[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  image: string;
  imageAlt: string;
  draft: boolean;
  /** Old Wix slug (the 9 legacy posts): drives the /post/<oldSlug>/ redirect stub. */
  oldSlug?: string;
  /** Rendered HTML up to the FAQ heading (the whole body when there is no FAQ). */
  bodyHtml: string;
  /** Rendered HTML after the FAQ section: the CTA + disclaimer. Empty without a FAQ. */
  outroHtml: string;
  /** The FAQ heading the page renders above the accordion. */
  faqHeading?: TocEntry;
  toc: TocEntry[];
  faq: FaqItem[];
  /** Plain body text for the search index (FAQ, CTA, disclaimer excluded). */
  bodyText: string;
  wordCount: number;
  /** Minutes: words / 200, min 1. */
  readTime: number;
}

export const LIBRARY_DIR = path.join(process.cwd(), 'content', 'library');
export const TECH_CATEGORY: LibraryCategory = 'Technology & the Law';
/** The anchor deadlines article is featured whenever it exists. */
export const FEATURED_SLUG = 'how-long-do-i-have-to-contest-a-trust-or-will-in-california';
export const DISCLAIMER_PREFIX = 'This article is general information';
/** The one draft toggle for every article surface lives in site.ts. */
const INCLUDE_DRAFTS_DEFAULT: boolean = site.showDraftArticles;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Newest first; on the same day, Technology & the Law sorts after the trust-and-estate articles. */
function byNewestTechLast(a: LibraryArticle, b: LibraryArticle): number {
  return (
    byNewest(a, b) || Number(a.category === TECH_CATEGORY) - Number(b.category === TECH_CATEGORY)
  );
}

function fail(slug: string, message: string): never {
  throw new Error(`content/library/${slug}.md: ${message}`);
}

function requireDate(meta: Record<string, string>, key: string, slug: string): string {
  const value = requireKey(meta, key, slug);
  if (!ISO_DATE.test(value)) fail(slug, `"${key}" must be yyyy-mm-dd, got "${value}"`);
  return value;
}

function validateCopy(slug: string, source: string, body: string): void {
  if (source.includes('—')) fail(slug, 'contains an em dash; use a spaced en dash');
  if (/^# /m.test(body)) fail(slug, 'body has an H1; the title is the H1');
  const lines = body.split('\n').filter((l) => l.trim() !== '');
  if (!lines[lines.length - 1]?.startsWith(DISCLAIMER_PREFIX))
    fail(slug, `must end with the disclaimer paragraph ("${DISCLAIMER_PREFIX}...")`);
}

/** Wraps the final paragraph (the disclaimer) so prose.css can style it. */
function markDisclaimer(html: string): string {
  const at = html.lastIndexOf('<p>');
  if (at === -1 || !html.endsWith('</p>')) return html;
  return `${html.slice(0, at)}<p class="disclaimer">${html.slice(at + 3)}`;
}

function splitAtFaq(html: string, faqHeading: TocEntry | undefined) {
  if (!faqHeading) return { bodyHtml: markDisclaimer(html), outroHtml: '' };
  const marker = `<h${faqHeading.level} id="${faqHeading.id}">`;
  const at = html.indexOf(marker);
  if (at === -1) throw new Error(`FAQ heading "${faqHeading.id}" not found in rendered HTML`);
  const rest = html.slice(at);
  const outro = rest.slice(rest.indexOf('\n') + 1);
  return { bodyHtml: html.slice(0, at).trimEnd(), outroHtml: markDisclaimer(outro) };
}

function loadArticle(fileName: string): LibraryArticle {
  const slug = fileName.replace(/\.md$/, '');
  const source = fs.readFileSync(path.join(LIBRARY_DIR, fileName), 'utf8');
  const { meta, body } = parseFrontmatter(source);
  validateCopy(slug, source, body);
  const category = requireKey(meta, 'category', slug);
  if (!isLibraryCategory(category)) fail(slug, `unknown category "${category}"`);
  const author = requireKey(meta, 'author', slug);
  getTeamMember(author);
  const description = requireKey(meta, 'description', slug);
  if (description.length > limits.descriptionMax)
    fail(slug, `description is ${description.length} chars (max ${limits.descriptionMax})`);
  const image = requireKey(meta, 'image', slug);
  if (!image.startsWith('/images/')) fail(slug, `image must live under /images/, got "${image}"`);
  const tags = parseList(meta.tags);
  if (tags.length === 0) fail(slug, 'needs at least one tag');
  const date = requireDate(meta, 'date', slug);

  // FAQ questions render inside the accordion, not as headings, so the TOC
  // and the rendered ids both come from the FAQ-stripped markdown.
  const visible = withoutFaqBody(body);
  const toc = extractHeadings(visible);
  const faqHeading = toc.find((h) => h.level === 2 && FAQ_HEADING.test(h.text));
  const html = renderMarkdown(visible, {
    linkPrefix: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  });
  const faq = extractFaq(body);
  if (faqHeading && faq.length === 0) fail(slug, 'FAQ section has no ### questions');
  const wordCount = stripMarkdown(body).split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: requireKey(meta, 'title', slug),
    description,
    excerpt: requireKey(meta, 'excerpt', slug),
    date,
    updated: meta.updated ? requireDate(meta, 'updated', slug) : date,
    author,
    category,
    categorySlug: categorySlug(category),
    tags,
    primaryKeyword: requireKey(meta, 'primaryKeyword', slug),
    secondaryKeywords: parseList(meta.secondaryKeywords),
    image,
    imageAlt: requireKey(meta, 'imageAlt', slug),
    draft: parseBool(meta.draft),
    oldSlug: meta.oldSlug,
    ...splitAtFaq(html, faqHeading),
    faqHeading,
    toc,
    faq,
    bodyText: searchableText(body),
    wordCount,
    readTime: Math.max(1, Math.round(wordCount / 200)),
  };
}

let cache: LibraryArticle[] | undefined;

function loadAll(): LibraryArticle[] {
  if (cache) return cache;
  if (!fs.existsSync(LIBRARY_DIR)) throw new Error(`${LIBRARY_DIR} does not exist`);
  const files = fs.readdirSync(LIBRARY_DIR).filter((f) => f.endsWith('.md'));
  if (files.length === 0) throw new Error('content/library/ has no articles');
  cache = files.map(loadArticle).sort(byNewestTechLast);
  const drafts = cache.filter((a) => a.draft).length;
  console.log(`library: ${cache.length - drafts} published, ${drafts} draft`);
  return cache;
}

export interface ArticleQuery {
  includeDrafts?: boolean;
}

/** Every article, newest first. Drafts follow `site.showDraftArticles` unless the caller says otherwise. */
export function getArticles(query: ArticleQuery = {}): LibraryArticle[] {
  const includeDrafts = query.includeDrafts ?? INCLUDE_DRAFTS_DEFAULT;
  return loadAll().filter((a) => includeDrafts || !a.draft);
}

export function getArticle(slug: string): LibraryArticle {
  const article = getArticles().find((a) => a.slug === slug);
  if (!article) throw new Error(`No library article with slug "${slug}"`);
  return article;
}

/** Same category first, then shared tags, newest first; Technology & the Law only relates to itself. */
export function getRelated(article: LibraryArticle, n = 3): LibraryArticle[] {
  const tech = article.category === TECH_CATEGORY;
  const pool = getArticles().filter(
    (a) => a.slug !== article.slug && (a.category === TECH_CATEGORY) === tech,
  );
  const score = (a: LibraryArticle): number =>
    (a.category === article.category ? 100 : 0) +
    a.tags.filter((t) => article.tags.includes(t)).length;
  return pool
    .map((a) => ({ a, s: score(a) }))
    .sort((x, y) => y.s - x.s || byNewest(x.a, y.a))
    .slice(0, n)
    .map(({ a }) => a);
}

export interface CategoryCount {
  category: LibraryCategory;
  slug: string;
  count: number;
}

/** Every category in LIBRARY_CATEGORIES order with how many articles each holds (zero included). */
export function getCategoriesWithCounts(): CategoryCount[] {
  const articles = getArticles();
  return LIBRARY_CATEGORIES.map((category) => ({
    category,
    slug: categorySlug(category),
    count: articles.filter((a) => a.category === category).length,
  }));
}

/** The pinned anchor article when present, else the newest non-tech article (published first). */
export function getFeatured(): LibraryArticle | undefined {
  const articles = getArticles();
  const nonTech = articles.filter((a) => a.category !== TECH_CATEGORY);
  return (
    articles.find((a) => a.slug === FEATURED_SLUG) ?? nonTech.find((a) => !a.draft) ?? nonTech[0]
  );
}
