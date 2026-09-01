/**
 * Section-level helpers over article markdown: split at `##` headings, pull
 * the FAQ entries out of `## Frequently asked questions`, and drop a
 * section's body while keeping its heading (the page renders the FAQ block
 * itself, so its prose must not render twice).
 */

import { stripMarkdown } from './markdown';
import { stripInline } from './markdown-inline';
import type { FaqItem } from '@/types/content';

export interface Section {
  /** Heading text without the `## ` marker; null for the intro before the first heading. */
  heading: string | null;
  /** Lines under the heading, heading excluded. */
  lines: string[];
}

export const FAQ_HEADING = /^frequently asked questions$/i;
export const CTA_HEADING = /^talk to /i;

/** Splits at every `## ` heading (not `###`). */
export function splitSections(markdown: string): Section[] {
  const sections: Section[] = [{ heading: null, lines: [] }];
  for (const raw of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const match = /^## (.+)$/.exec(raw.trim());
    if (match) sections.push({ heading: match[1], lines: [] });
    else sections[sections.length - 1].lines.push(raw);
  }
  return sections;
}

function isFaqSection(section: Section): boolean {
  return section.heading !== null && FAQ_HEADING.test(stripInline(section.heading));
}

/** `### Question?` + following paragraph(s) → FaqItem, from the FAQ section only. */
export function extractFaq(markdown: string): FaqItem[] {
  const faq = splitSections(markdown).find(isFaqSection);
  if (!faq) return [];
  const items: FaqItem[] = [];
  let current: { question: string; answer: string[] } | null = null;
  for (const raw of faq.lines) {
    const question = /^### (.+)$/.exec(raw.trim());
    if (question) {
      if (current) items.push(finishItem(current));
      current = { question: stripInline(question[1]), answer: [] };
    } else if (current && raw.trim() !== '') {
      current.answer.push(raw);
    }
  }
  if (current) items.push(finishItem(current));
  return items;
}

function finishItem(item: { question: string; answer: string[] }): FaqItem {
  const answer = stripMarkdown(item.answer.join('\n'));
  if (!answer) throw new Error(`FAQ "${item.question}" has no answer`);
  return { question: item.question, answer };
}

/** The markdown with the FAQ section's body removed (its `##` heading stays for the TOC). */
export function withoutFaqBody(markdown: string): string {
  return splitSections(markdown)
    .map((section) => {
      const body = isFaqSection(section) ? [] : section.lines;
      const head = section.heading === null ? [] : [`## ${section.heading}`];
      return [...head, ...body].join('\n');
    })
    .join('\n');
}

/** Body text for the search index: FAQ, CTA, and disclaimer removed so they cannot match every query. */
export function searchableText(markdown: string): string {
  const kept = splitSections(markdown).filter(
    (section) =>
      !isFaqSection(section) && !(section.heading !== null && CTA_HEADING.test(section.heading)),
  );
  return stripMarkdown(
    kept.map((section) => [section.heading ?? '', ...section.lines].join('\n')).join('\n'),
  );
}
