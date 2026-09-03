'use client';

import { Button } from '@/components/ui/Button';
import { consultCta, secondaryCta } from '@/config/site';
import type { CategoryCount } from '@/lib/library/articles';
import type { LibraryListItem } from '@/lib/library/index-item';
import { FilterBar } from './FilterBar';
import { LibraryCard } from './LibraryCard';
import { useLibrarySearch, type LibrarySearch } from './useLibrarySearch';

const RESULTS_ID = 'library-results';

interface LibraryClientProps {
  items: LibraryListItem[];
  categories: CategoryCount[];
}

function resultText(search: LibrarySearch, label: string | undefined): string {
  const n = search.results.length;
  const where = label ? ` in ${label}` : '';
  if (search.searching) {
    const noun = n === 1 ? 'result' : 'results';
    const sorted = n > 1 ? ' · sorted by relevance' : '';
    return `${n} ${noun} for "${search.query.trim()}"${where}${sorted}`;
  }
  return `${n} ${n === 1 ? 'article' : 'articles'}${where}`;
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-white p-8 text-center">
      <p className="font-serif text-h3 text-ink">Nothing matches that yet.</p>
      <p className="mx-auto mt-2 max-w-[44ch] text-body text-ink-2">
        Try a shorter word, or ask us directly.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button href={consultCta.href}>{consultCta.label}</Button>
        <Button variant="secondary" href={secondaryCta.href}>
          {secondaryCta.label}
        </Button>
      </div>
    </div>
  );
}

/** Filter bar, result line, and card grid; the only client component on /library/. */
export function LibraryClient({ items, categories }: LibraryClientProps) {
  const search = useLibrarySearch(items);
  const label = categories.find((c) => c.slug === search.category)?.category;
  return (
    <div>
      <FilterBar
        categories={categories}
        category={search.category}
        query={search.query}
        resultsId={RESULTS_ID}
        onCategory={search.setCategory}
        onQuery={search.setQuery}
      />
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
        <p aria-live="polite" className="text-small text-ink-3">
          {resultText(search, label)}
        </p>
        {search.active && (
          <button
            type="button"
            onClick={search.clear}
            className="tap-link text-small font-medium text-maroon-700 transition-colors hover:text-maroon-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
      <div id={RESULTS_ID} className="mt-6">
        {search.results.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {search.results.map(({ item, snippet, bodyHits }, i) => (
              <li key={item.slug}>
                <LibraryCard
                  item={item}
                  terms={search.searching ? search.terms : []}
                  snippet={snippet}
                  bodyHits={bodyHits}
                  priority={i === 0}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
