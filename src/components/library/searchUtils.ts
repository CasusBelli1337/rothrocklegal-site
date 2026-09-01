/**
 * Client-side library search (LIBRARY-SPEC §5), mirroring legion.law's
 * semantics: lowercase whitespace tokens minus stop words, every token must
 * appear somewhere in the haystack, multi-word queries also score as a
 * phrase, matches are highlighted from merged ranges, and a body hit yields
 * a word-snapped snippet. Pure functions; tested in searchUtils.test.ts.
 */

export interface MatchRange {
  start: number;
  end: number;
}

export interface SnippetResult {
  text: string;
  matches: MatchRange[];
  truncatedStart: boolean;
  truncatedEnd: boolean;
}

export interface SearchableItem {
  title: string;
  excerpt: string;
  tags: readonly string[];
  date: string;
  updated: string;
  /** Plain body text from /library/index.json; absent until it is fetched. */
  bodyText?: string;
}

export interface RankedItem<T extends SearchableItem> {
  item: T;
  bodyHits: number;
  snippet: SnippetResult | null;
}

const STOP_WORDS = new Set(
  (
    'a an the and or but nor so yet of in on at by to for from with as into ' +
    'is are was were be been being am this that these those it its i you we ' +
    'they he she do does did not no'
  ).split(' '),
);

/** Lowercase whitespace tokens without stop words (unless the query is only stop words). */
export function tokenizeQuery(query: string): string[] {
  const raw = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = raw.filter((t) => !STOP_WORDS.has(t));
  return filtered.length > 0 ? filtered : raw;
}

/** The whole query as one lowercase phrase when it has more than one word. */
export function phraseOf(query: string): string | null {
  const phrase = query.trim().toLowerCase().replace(/\s+/g, ' ');
  return phrase.includes(' ') ? phrase : null;
}

export function matchesAllTokens(haystack: string, tokens: readonly string[]): boolean {
  const hay = haystack.toLowerCase();
  return tokens.every((t) => hay.includes(t));
}

/** Sorted, non-overlapping ranges of every token occurrence. */
export function findRanges(text: string, tokens: readonly string[]): MatchRange[] {
  if (!text || tokens.length === 0) return [];
  const lower = text.toLowerCase();
  const raw: MatchRange[] = [];
  for (const token of tokens) {
    if (!token) continue;
    let i = lower.indexOf(token);
    while (i !== -1) {
      raw.push({ start: i, end: i + token.length });
      i = lower.indexOf(token, i + token.length);
    }
  }
  raw.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: MatchRange[] = [];
  for (const range of raw) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) last.end = Math.max(last.end, range.end);
    else merged.push({ ...range });
  }
  return merged;
}

export function countMatches(text: string, tokens: readonly string[]): number {
  return findRanges(text, tokens).length;
}

/** ~`contextChars` each side of the first match, snapped to word boundaries. */
export function extractSnippet(
  text: string,
  tokens: readonly string[],
  contextChars = 90,
): SnippetResult | null {
  const ranges = findRanges(text, tokens);
  if (ranges.length === 0) return null;
  const first = ranges[0];
  let start = Math.max(0, first.start - contextChars);
  let end = Math.min(text.length, first.end + contextChars);
  if (start > 0) {
    const nextSpace = text.indexOf(' ', start);
    if (nextSpace !== -1 && nextSpace < first.start) start = nextSpace + 1;
  }
  if (end < text.length) {
    const prevSpace = text.lastIndexOf(' ', end);
    if (prevSpace > first.end) end = prevSpace;
  }
  return {
    text: text.slice(start, end),
    matches: ranges
      .filter((r) => r.start >= start && r.end <= end)
      .map((r) => ({ start: r.start - start, end: r.end - start })),
    truncatedStart: start > 0,
    truncatedEnd: end < text.length,
  };
}

function scoreItem(item: SearchableItem, tokens: string[], phrase: string | null): number {
  const phraseTerms = phrase ? [phrase] : [];
  return (
    countMatches(item.title, tokens) * 50 +
    countMatches(item.excerpt, tokens) * 10 +
    countMatches(item.tags.join(' '), tokens) * 10 +
    countMatches(item.bodyText ?? '', tokens) +
    countMatches(item.title, phraseTerms) * 200 +
    countMatches(item.bodyText ?? '', phraseTerms) * 20
  );
}

/** Terms to highlight: the phrase first (so it marks as one unit), then the tokens. */
export function displayTerms(query: string): string[] {
  const tokens = tokenizeQuery(query);
  const phrase = phraseOf(query);
  return phrase ? [phrase, ...tokens] : tokens;
}

/** Items matching every token, best score first; ties newest `updated` first. */
export function rankItems<T extends SearchableItem>(
  items: readonly T[],
  query: string,
): RankedItem<T>[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return items.map((item) => ({ item, bodyHits: 0, snippet: null }));
  const phrase = phraseOf(query);
  const terms = displayTerms(query);
  return items
    .filter((item) =>
      matchesAllTokens(
        `${item.title} ${item.excerpt} ${item.tags.join(' ')} ${item.bodyText ?? ''}`,
        tokens,
      ),
    )
    .map((item) => {
      const bodyHits = countMatches(item.bodyText ?? '', tokens);
      const snippet = bodyHits > 0 ? extractSnippet(item.bodyText ?? '', terms) : null;
      return { item, bodyHits, snippet, score: scoreItem(item, tokens, phrase) };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.item.updated.localeCompare(a.item.updated) ||
        b.item.date.localeCompare(a.item.date),
    )
    .map(({ item, bodyHits, snippet }) => ({ item, bodyHits, snippet }));
}

export interface LibraryParams {
  /** Category slug, '' for all. */
  category: string;
  q: string;
}

/** `?category=deadlines&q=120+days` → state; unknown keys ignored. */
export function parseLibraryParams(search: string): LibraryParams {
  const params = new URLSearchParams(search);
  return { category: params.get('category') ?? '', q: params.get('q') ?? '' };
}

/** State → `?category=…&q=…`, or '' when nothing is active (keeps the URL clean). */
export function buildLibraryParams(state: LibraryParams): string {
  const params = new URLSearchParams();
  if (state.category) params.set('category', state.category);
  if (state.q.trim()) params.set('q', state.q.trim());
  const query = params.toString();
  return query ? `?${query}` : '';
}
