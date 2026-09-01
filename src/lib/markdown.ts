/**
 * Minimal, deterministic markdown-to-HTML renderer for library articles.
 * Supports exactly what the content uses (CONTRACTS §3, LIBRARY-SPEC §7):
 * `##`/`###` headings with ids, paragraphs, ul/ol nested one level,
 * blockquotes, simple pipe tables, horizontal rules, and the inline set in
 * markdown-inline.ts. No external dependencies.
 */

import { HeadingIds, renderInline, stripInline, type InlineOptions } from './markdown-inline';
import { bindSectionSigns } from './typography';

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export type RenderOptions = InlineOptions;

interface ListItem {
  html: string;
  children?: ListState;
}

interface ListState {
  tag: 'ul' | 'ol';
  items: ListItem[];
}

const HEADING = /^(##{1,2}) (.+)$/;
const LIST_ITEM = /^(\s*)(?:[-*]|\d+\.)\s+(.*)$/;
const RULE = /^(?:-{3,}|\*{3,})$/;

function listTag(marker: string): 'ul' | 'ol' {
  return /^\d/.test(marker.trim()) ? 'ol' : 'ul';
}

function renderList(list: ListState): string {
  const items = list.items
    .map((item) => `<li>${item.html}${item.children ? renderList(item.children) : ''}</li>`)
    .join('');
  return `<${list.tag}>${items}</${list.tag}>`;
}

function splitCells(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

class BlockRenderer {
  private readonly out: string[] = [];
  private readonly ids = new HeadingIds();
  private paragraph: string[] = [];
  private quote: string[] = [];
  private table: string[] = [];
  private list: ListState | null = null;

  constructor(private readonly options: RenderOptions) {}

  render(markdown: string): string {
    for (const raw of markdown.replace(/\r\n/g, '\n').split('\n')) {
      this.line(raw.trimEnd());
    }
    this.flushAll();
    return this.out.join('\n');
  }

  private inline(text: string): string {
    return bindSectionSigns(renderInline(text, this.options));
  }

  private line(line: string): void {
    const trimmed = line.trim();
    if (trimmed === '') return this.blank();
    if (trimmed.startsWith('|')) return this.tableRow(trimmed);
    if (this.table.length > 0) this.flushTable();
    const heading = HEADING.exec(trimmed);
    if (heading) return this.heading(heading[1].length as 2 | 3, heading[2]);
    if (RULE.test(trimmed)) return this.rule();
    if (trimmed.startsWith('>')) return this.quoteLine(trimmed);
    const item = LIST_ITEM.exec(line);
    if (item) return this.listItem(item[1].length, line, item[2]);
    if (this.list && /^\s{2,}/.test(line)) return this.continuation(trimmed);
    this.flushList();
    this.flushQuote();
    this.paragraph.push(trimmed);
  }

  /**
   * A blank line ends a paragraph, quote, or table but not a list: items
   * separated by blank lines ("loose" lists) are one list, so a numbered
   * walkthrough keeps counting instead of restarting at 1. Every other block
   * type flushes the list itself when it starts.
   */
  private blank(): void {
    this.flushParagraph();
    this.flushQuote();
    if (this.table.length > 0) this.flushTable();
  }

  private heading(level: 2 | 3, text: string): void {
    this.flushAll();
    const id = this.ids.next(text);
    this.out.push(`<h${level} id="${id}">${this.inline(text)}</h${level}>`);
  }

  private rule(): void {
    this.flushAll();
    this.out.push('<hr />');
  }

  private quoteLine(trimmed: string): void {
    this.flushParagraph();
    this.flushList();
    this.quote.push(trimmed.replace(/^>\s?/, ''));
  }

  private tableRow(trimmed: string): void {
    this.flushParagraph();
    this.flushList();
    this.flushQuote();
    this.table.push(trimmed);
  }

  private listItem(indent: number, line: string, text: string): void {
    this.flushParagraph();
    this.flushQuote();
    const tag = listTag(line.trim());
    const html = this.inline(text);
    if (indent >= 2 && this.list && this.list.items.length > 0) {
      const parent = this.list.items[this.list.items.length - 1];
      parent.children ??= { tag, items: [] };
      parent.children.items.push({ html });
      return;
    }
    if (this.list && this.list.tag !== tag) this.flushList();
    this.list ??= { tag, items: [] };
    this.list.items.push({ html });
  }

  private continuation(trimmed: string): void {
    if (!this.list) return;
    const last = this.list.items[this.list.items.length - 1];
    last.html += `<br />${this.inline(trimmed)}`;
  }

  private flushParagraph(): void {
    if (this.paragraph.length === 0) return;
    this.out.push(`<p>${this.inline(this.paragraph.join(' '))}</p>`);
    this.paragraph = [];
  }

  private flushList(): void {
    if (!this.list) return;
    this.out.push(renderList(this.list));
    this.list = null;
  }

  private flushQuote(): void {
    if (this.quote.length === 0) return;
    const paragraphs = this.quote
      .join('\n')
      .split(/\n\s*\n/)
      .map((p) => `<p>${this.inline(p.replace(/\n/g, ' ').trim())}</p>`)
      .join('');
    this.out.push(`<blockquote>${paragraphs}</blockquote>`);
    this.quote = [];
  }

  private flushTable(): void {
    const rows = this.table.map(splitCells);
    this.table = [];
    const separator = rows[1];
    if (!separator || !separator.every((cell) => /^:?-+:?$/.test(cell))) {
      throw new Error(`Malformed table near "${rows[0]?.join(' | ')}"`);
    }
    const cells = (row: string[], tag: 'th' | 'td'): string =>
      row.map((cell) => `<${tag}>${this.inline(cell)}</${tag}>`).join('');
    const head = `<thead><tr>${cells(rows[0], 'th')}</tr></thead>`;
    const body = rows
      .slice(2)
      .map((row) => `<tr>${cells(row, 'td')}</tr>`)
      .join('');
    // tabindex: the wrapper scrolls sideways on phones, so keyboards must be able to reach it.
    this.out.push(
      `<div class="table-wrap" tabindex="0"><table>${head}<tbody>${body}</tbody></table></div>`,
    );
  }

  private flushAll(): void {
    this.flushParagraph();
    this.flushList();
    this.flushQuote();
    if (this.table.length > 0) this.flushTable();
  }
}

export function renderMarkdown(markdown: string, options: RenderOptions = {}): string {
  return new BlockRenderer(options).render(markdown);
}

/** `##` and `###` headings with the same ids the renderer emits. */
export function extractHeadings(markdown: string): Heading[] {
  const ids = new HeadingIds();
  const headings: Heading[] = [];
  for (const raw of markdown.split('\n')) {
    const match = HEADING.exec(raw.trim());
    if (!match) continue;
    headings.push({
      id: ids.next(match[2]),
      text: stripInline(match[2]),
      level: match[1].length as 2 | 3,
    });
  }
  return headings;
}

/** Markdown → plain text with original case (search index, JSON-LD answers). */
export function stripMarkdown(markdown: string): string {
  const lines = markdown.split('\n').map((raw) => {
    const line = raw.trim();
    if (RULE.test(line) || /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(line)) return '';
    return line
      .replace(/^#{1,6}\s+/, '')
      .replace(/^>\s?/, '')
      .replace(/^(?:[-*]|\d+\.)\s+/, '')
      .replace(/^\||\|$/g, '')
      .replace(/\s*\|\s*/g, ' ');
  });
  return stripInline(lines.join(' '));
}
