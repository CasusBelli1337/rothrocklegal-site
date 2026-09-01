/**
 * Inline markdown pieces shared by the block renderer and the extractors:
 * escaping, `**bold**`, `*italic*`, `` `code` ``, `[text](href)`, and the
 * heading-id slugger. Deterministic; no dependencies.
 */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface InlineOptions {
  /** Prefix for site-relative hrefs (the basePath); `<a>` in raw HTML gets no automatic basePath. */
  linkPrefix?: string;
}

function renderLink(text: string, href: string, prefix: string): string {
  const external = /^https?:\/\//i.test(href);
  const url = href.startsWith('/') ? `${prefix}${href}` : href;
  const rel = external ? ' rel="noopener"' : '';
  return `<a href="${url}"${rel}>${text}</a>`;
}

function renderEmphasis(escaped: string, prefix: string): string {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, href: string) =>
      renderLink(text, href, prefix),
    );
}

/** Inline markdown → HTML. Code spans are escaped verbatim and skip the other rules. */
export function renderInline(text: string, options: InlineOptions = {}): string {
  const prefix = options.linkPrefix ?? '';
  return text
    .split(/(`[^`]+`)/)
    .map((part) =>
      part.startsWith('`') && part.endsWith('`') && part.length > 1
        ? `<code>${escapeHtml(part.slice(1, -1))}</code>`
        : renderEmphasis(escapeHtml(part), prefix),
    )
    .join('');
}

/** Inline markdown → plain text (for TOC labels, FAQ answers, and the search index). */
export function stripInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1$2')
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 'How long do I have?' → 'how-long-do-i-have'. */
export function slugifyHeading(text: string): string {
  return stripInline(text)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’"“”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Hands out unique heading ids in document order: `key`, `key-2`, `key-3`. */
export class HeadingIds {
  private readonly seen = new Map<string, number>();

  next(text: string): string {
    const base = slugifyHeading(text) || 'section';
    const count = (this.seen.get(base) ?? 0) + 1;
    this.seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  }
}
