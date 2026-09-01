import { useEffect, useMemo, useState } from 'react';
import { asset } from '@/config/site';
import type { LibraryIndexItem, LibraryListItem } from '@/lib/library/index-item';
import {
  buildLibraryParams,
  displayTerms,
  parseLibraryParams,
  rankItems,
  tokenizeQuery,
  type RankedItem,
} from './searchUtils';

const DEBOUNCE_MS = 120;

type Bodies = Record<string, string>;

function useDebounced(value: string, ms: number): [string, (v: string) => void] {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return [debounced, setDebounced];
}

/** Mirrors the active filters into `?category=&q=` once the URL has been read. */
function useUrlSync(hydrated: boolean, category: string, q: string): void {
  useEffect(() => {
    if (!hydrated) return;
    const { pathname, hash } = window.location;
    const search = buildLibraryParams({ category, q });
    window.history.replaceState(null, '', `${pathname}${search}${hash}`);
  }, [hydrated, category, q]);
}

/** Fetches /library/index.json once, on the first query with real tokens. */
function useBodyIndex(query: string): Bodies | null {
  const [bodies, setBodies] = useState<Bodies | null>(null);
  useEffect(() => {
    if (bodies !== null || tokenizeQuery(query).length === 0) return;
    let cancelled = false;
    fetch(asset('/library/index.json'))
      .then((res) => {
        if (!res.ok) throw new Error(`index.json responded ${res.status}`);
        return res.json() as Promise<LibraryIndexItem[]>;
      })
      .then((index) => {
        if (cancelled) return;
        setBodies(Object.fromEntries(index.map((i) => [i.slug, i.bodyText])));
      })
      .catch((error: unknown) => {
        console.error('library index unavailable; searching titles and excerpts only', error);
        if (!cancelled) setBodies({});
      });
    return () => {
      cancelled = true;
    };
  }, [bodies, query]);
  return bodies;
}

export interface LibrarySearch {
  query: string;
  setQuery: (query: string) => void;
  /** Active category slug, '' for all. */
  category: string;
  setCategory: (slug: string) => void;
  clear: () => void;
  /** True once the debounced query has real tokens. */
  searching: boolean;
  /** Terms to highlight (phrase first). */
  terms: string[];
  results: RankedItem<LibraryListItem>[];
  /** Any chip or query active. */
  active: boolean;
}

/**
 * Search state for the library index: URL sync (`?category=&q=`), a 120ms
 * debounce, and the body-text index fetched once on the first real query.
 */
export function useLibrarySearch(items: readonly LibraryListItem[]): LibrarySearch {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [debounced, setDebounced] = useDebounced(query, DEBOUNCE_MS);
  const [hydrated, setHydrated] = useState(false);

  // Static export has no server params: read the URL after mount.
  useEffect(() => {
    const params = parseLibraryParams(window.location.search);
    setCategory(params.category);
    setQuery(params.q);
    setDebounced(params.q);
    setHydrated(true);
  }, [setDebounced]);

  useUrlSync(hydrated, category, debounced);
  const bodies = useBodyIndex(debounced);

  const results = useMemo(() => {
    const scoped = items
      .filter((item) => category === '' || item.categorySlug === category)
      .map((item) => {
        const bodyText = bodies?.[item.slug];
        return bodyText ? { ...item, bodyText } : item;
      });
    return rankItems(scoped, debounced);
  }, [items, category, debounced, bodies]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    clear: () => {
      setQuery('');
      setDebounced('');
      setCategory('');
    },
    searching: tokenizeQuery(debounced).length > 0,
    terms: displayTerms(debounced),
    results,
    active: category !== '' || query !== '',
  };
}
