import { describe, expect, it } from 'vitest';
import {
  buildLibraryParams,
  displayTerms,
  extractSnippet,
  findRanges,
  matchesAllTokens,
  parseLibraryParams,
  phraseOf,
  rankItems,
  tokenizeQuery,
} from './searchUtils';

const item = (
  title: string,
  extra: Partial<{
    excerpt: string;
    tags: string[];
    bodyText: string;
    date: string;
    updated: string;
  }> = {},
) => ({
  title,
  excerpt: extra.excerpt ?? '',
  tags: extra.tags ?? [],
  bodyText: extra.bodyText,
  date: extra.date ?? '2026-01-01',
  updated: extra.updated ?? extra.date ?? '2026-01-01',
});

describe('tokenizeQuery', () => {
  it('lowercases, splits on whitespace, and drops stop words', () => {
    expect(tokenizeQuery('  The Trustee AND  accounting ')).toEqual(['trustee', 'accounting']);
  });

  it('keeps the raw tokens when the query is only stop words', () => {
    expect(tokenizeQuery('the and')).toEqual(['the', 'and']);
  });

  it('returns nothing for an empty query', () => {
    expect(tokenizeQuery('   ')).toEqual([]);
  });

  it('treats multi-word queries as a phrase too', () => {
    expect(phraseOf('undue  influence')).toBe('undue influence');
    expect(phraseOf('trustee')).toBeNull();
    expect(displayTerms('undue influence')).toEqual(['undue influence', 'undue', 'influence']);
  });
});

describe('matching and ranges', () => {
  it('requires every token', () => {
    expect(matchesAllTokens('Trust contest deadline', ['trust', 'deadline'])).toBe(true);
    expect(matchesAllTokens('Trust contest deadline', ['trust', 'will'])).toBe(false);
  });

  it('merges overlapping ranges from different tokens', () => {
    expect(findRanges('undue influence', ['undue influence', 'undue', 'influence'])).toEqual([
      { start: 0, end: 15 },
    ]);
    expect(findRanges('a trustee, another trustee', ['trustee'])).toEqual([
      { start: 2, end: 9 },
      { start: 19, end: 26 },
    ]);
  });
});

describe('extractSnippet', () => {
  const text =
    'The clock runs from mailing, not from the day you read the letter. Service by mail is complete on deposit under the Probate Code. Day one is the postmark, and there is no five-day extension for mail.';

  it('snaps to word boundaries and flags truncation', () => {
    const snippet = extractSnippet(text, ['deposit'], 20);
    expect(snippet).not.toBeNull();
    expect(snippet?.text).toBe('is complete on deposit under the Probate');
    expect(snippet?.truncatedStart).toBe(true);
    expect(snippet?.truncatedEnd).toBe(true);
    expect(snippet?.matches).toEqual([{ start: 15, end: 22 }]);
  });

  it('returns null with no match', () => {
    expect(extractSnippet(text, ['zebra'])).toBeNull();
  });
});

describe('rankItems', () => {
  const items = [
    item('Trustee removal in California', {
      bodyText: 'A trustee can be removed.',
      date: '2026-02-01',
    }),
    item('How to read an accounting', {
      bodyText: 'Ask the trustee for an accounting. The trustee must answer.',
      date: '2026-03-01',
    }),
    item('Will contests', { excerpt: 'No trustee here', date: '2026-01-01' }),
    item('Undue influence explained', { bodyText: 'Nothing relevant.', date: '2026-04-01' }),
  ];

  it('returns everything in original order when the query is empty', () => {
    expect(rankItems(items, '').map((r) => r.item.title)).toEqual(items.map((i) => i.title));
  });

  it('ranks title hits above excerpt and body hits, and drops non-matches', () => {
    const titles = rankItems(items, 'trustee').map((r) => r.item.title);
    expect(titles).toEqual([
      'Trustee removal in California',
      'Will contests',
      'How to read an accounting',
    ]);
  });

  it('reports body hit counts and a snippet', () => {
    const ranked = rankItems(items, 'trustee');
    const accounting = ranked.find((r) => r.item.title === 'How to read an accounting');
    expect(accounting?.bodyHits).toBe(2);
    expect(accounting?.snippet?.text).toContain('Ask the trustee');
  });

  it('boosts an exact phrase in the title over scattered words', () => {
    const pair = [
      item('Undue influence', { bodyText: 'influence undue', date: '2026-05-01' }),
      item('Influence that was undue', {
        bodyText: 'undue influence undue influence',
        date: '2026-01-01',
      }),
    ];
    expect(rankItems(pair, 'undue influence')[0].item.title).toBe('Undue influence');
  });

  it('breaks ties by newest updated', () => {
    const pair = [
      item('Old note', { bodyText: 'trustee', date: '2025-01-01', updated: '2025-01-01' }),
      item('New note', { bodyText: 'trustee', date: '2025-01-01', updated: '2026-01-01' }),
    ];
    expect(rankItems(pair, 'trustee')[0].item.title).toBe('New note');
  });
});

describe('URL params', () => {
  it('round-trips category and query', () => {
    const state = { category: 'technology-and-the-law', q: '120 days' };
    const search = buildLibraryParams(state);
    expect(search).toBe('?category=technology-and-the-law&q=120+days');
    expect(parseLibraryParams(search)).toEqual(state);
  });

  it('produces an empty string when nothing is active', () => {
    expect(buildLibraryParams({ category: '', q: '  ' })).toBe('');
    expect(parseLibraryParams('')).toEqual({ category: '', q: '' });
  });
});
