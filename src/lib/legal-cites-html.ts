/**
 * Text-node walker for the cite passes (legal-cites.ts). The HTML is our own
 * renderer's output (markdown.ts): text is escaped, attribute values never
 * hold a raw `>`, and elements nest cleanly, so a split on `<...>` is exact.
 */

const TAG_SPLIT = /(<[^>]+>)/;
const TAG_NAME = /^<(\/?)([A-Za-z][A-Za-z0-9]*)/;

/**
 * Elements no cite pass rewrites: headings are TOC labels and stay plain,
 * links and code spans are literal.
 */
export const PROSE_SKIP_TAGS: readonly string[] = ['a', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

/** Applies `fn` to every text node that is not inside one of `skipTags`. Tags pass through untouched. */
export function mapTextNodes(
  html: string,
  skipTags: readonly string[],
  fn: (text: string) => string,
): string {
  const skip = new Set(skipTags.map((tag) => tag.toLowerCase()));
  let depth = 0;
  return html
    .split(TAG_SPLIT)
    .map((part) => {
      const tag = TAG_NAME.exec(part);
      if (tag) {
        if (skip.has(tag[2].toLowerCase()) && !part.endsWith('/>')) depth += tag[1] ? -1 : 1;
        return part;
      }
      return depth > 0 || part === '' ? part : fn(part);
    })
    .join('');
}
