import fs from 'node:fs';
import path from 'node:path';
import {
  PRACTICE_DISCLAIMER,
  practiceAreas,
  practiceHref,
  practiceHub,
  practicePages,
  type PracticeArea,
} from '@/config/practice-areas';
import { counties, courts, listNames } from '@/config/service-areas';
import { consultCta, site } from '@/config/site';
import { getTeamMember, hasPlaceholders, team, teamHref } from '@/config/team';
import { parseFrontmatter } from '@/lib/frontmatter';
import { getArticles, type LibraryArticle } from '@/lib/library/articles';

/**
 * /llms.txt (the index, SEO-SPEC §7) and /llms-full.txt (the full text) for AI answer
 * engines, built from config and content at build. Drafts and unverified bios stay out.
 * Both read like the site: plain English, facts from config, no em dash.
 */

export const LLMS_FULL_PATH = '/llms-full.txt';
const url = (p: string) => `${site.canonicalHost}${p}`;

/** Site-relative Markdown links made absolute, so a model reading the file can follow them. */
export function absoluteLinks(markdown: string): string {
  return markdown.replace(/\]\(\//g, `](${site.canonicalHost}/`);
}

function publishedArticles(): LibraryArticle[] {
  return getArticles({ includeDrafts: false });
}

/** The opening block both files share: who the firm is, what it handles, where, and how to reach it. */
function preface(): string[] {
  const topics = listNames(practiceAreas.map((a) => a.topic));
  return [
    `> ${site.name} is a trust and estate litigation law firm in ${site.office.city}, ` +
      `${site.office.regionName}. ${site.description}`,
    '',
    `- What the firm handles: ${topics}.`,
    `- Where: ${site.office.appointments} Counties: ${listNames(counties)}. ` +
      `Courts: ${listNames(courts.map((c) => `${c.name} (${c.city})`))}.`,
    `- Lawyers: ${listNames(team.filter((m) => !hasPlaceholders(m)).map((m) => `${m.name} (${m.title})`))}. ` +
      `Responsible attorney for this site: ${site.responsibleAttorney}.`,
    `- How to reach the firm: ${site.consultLine} Consult request: ${url(consultCta.href)}. ` +
      `Email: ${site.email}. ${site.replyPromise}`,
  ];
}

export function buildLlmsTxt(): string {
  const attorneys = team.filter((m) => !hasPlaceholders(m));
  const optional = [
    `[About](${url('/about/')})`,
    `[FAQ](${url('/faq/')})`,
    `[Where we practice](${url('/service-areas/')})`,
    `[Contact](${url('/contact/')})`,
    `[Accessibility](${url('/accessibility/')})`,
    ...(site.legalPagesDraft
      ? []
      : [`[Privacy](${url('/privacy-policy/')})`, `[Disclaimer](${url('/disclaimer/')})`]),
  ];
  const lines = [
    `# ${site.name}`,
    ...preface(),
    '',
    '## Practice areas',
    `- [${practiceHub.title}](${url(practiceHref(practiceHub))}): ${practiceHub.description}`,
    ...practicePages.map((a) => `- [${a.title}](${url(practiceHref(a))}): ${a.description}`),
    '',
    '## Deadlines',
    `- [How long do I have?](${url('/how-long-do-i-have/')}): plain-English California deadline wizard`,
    '',
    '## Attorneys',
    ...attorneys.map((m) => `- [${m.name}](${url(teamHref(m))}): ${m.title}. ${m.focus}.`),
    '',
    '## Library',
    ...publishedArticles().map(
      (a) => `- [${a.title}](${url(`/library/${a.slug}/`)}) (updated ${a.updated}): ${a.excerpt}`,
    ),
    '',
    '## Full text',
    `- [llms-full.txt](${url(LLMS_FULL_PATH)}): every practice page and library article in full, as Markdown`,
    '',
    '## Optional',
    `- ${optional.join(', ')}`,
    '',
  ];
  return lines.join('\n');
}

/** A practice page as the visitor reads it: summary, deadline, statutes, body, FAQ. */
function practiceText(area: PracticeArea): string[] {
  const author = getTeamMember(area.author);
  const body = fs.readFileSync(
    path.join(process.cwd(), 'content', 'practice', `${area.slug}.md`),
    'utf8',
  );
  return [
    `# ${area.seoTitle}`,
    '',
    `URL: ${url(practiceHref(area))}`,
    `By ${author.name}, ${author.title}. Updated ${area.updatedAt}.`,
    '',
    area.summary,
    '',
    `## ${area.deadline.headline}`,
    '',
    area.deadline.body,
    '',
    '## The law',
    '',
    ...area.statutes.map((s) => `- ${s.cite}: ${s.plain}`),
    '',
    absoluteLinks(body.replace(/\r\n/g, '\n').trim()),
    '',
    '## Frequently asked questions',
    '',
    ...area.faq.flatMap((f) => [`### ${f.question}`, '', f.answer, '']),
  ];
}

/** A library article: its byline, dates, and the Markdown body exactly as published. */
function articleText(article: LibraryArticle): string[] {
  const author = getTeamMember(article.author);
  const source = fs.readFileSync(
    path.join(process.cwd(), 'content', 'library', `${article.slug}.md`),
    'utf8',
  );
  return [
    `# ${article.title}`,
    '',
    `URL: ${url(`/library/${article.slug}/`)}`,
    `By ${author.name}, ${author.title}. Published ${article.date}. Updated ${article.updated}. ` +
      `Category: ${article.category}.`,
    '',
    article.description,
    '',
    absoluteLinks(parseFrontmatter(source).body),
  ];
}

export function buildLlmsFullTxt(): string {
  const docs = [...practiceAreas.map(practiceText), ...publishedArticles().map(articleText)];
  const head = [
    `# ${site.name}: full text`,
    ...preface(),
    '',
    `Every practice page, then every published library article, newest first. ${PRACTICE_DISCLAIMER}`,
  ];
  return [head, ...docs].map((lines) => lines.join('\n')).join('\n\n---\n\n') + '\n';
}
