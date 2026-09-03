import { useEffect, useRef } from 'react';
import { CloseIcon } from '@/components/icons';
import { useLens } from '@/lib/lens/useLens';
import type { CategoryCount } from '@/lib/library/articles';

interface FilterBarProps {
  categories: readonly CategoryCount[];
  /** Active category slug, '' for all. */
  category: string;
  query: string;
  /** id of the results region the search input controls. */
  resultsId: string;
  onCategory: (slug: string) => void;
  onQuery: (query: string) => void;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const tone = active
    ? 'border-maroon-700 bg-maroon-700 text-white'
    : 'border-line-strong bg-white text-ink-2 hover:border-maroon-700 hover:text-maroon-700';
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-11 shrink-0 rounded-full border px-4 text-small font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-500 ${tone}`}
    >
      {children}
    </button>
  );
}

function CategoryChips({
  categories,
  category,
  onCategory,
}: Pick<FilterBarProps, 'categories' | 'category' | 'onCategory'>) {
  const rowRef = useRef<HTMLDivElement>(null);
  // A category chip is a small lens signal (docs/LENS.md); the search stays exactly as it was.
  const { record } = useLens();
  const pick = (slug: string) => {
    record(`chip:${slug}`);
    onCategory(slug);
  };

  // On phones the chips scroll sideways; a deep link (?category=...) must show its chip.
  // Horizontal scroll only, so the page itself never jumps on load.
  useEffect(() => {
    const row = rowRef.current;
    const active = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !active) return;
    const overflow = active.offsetLeft + active.offsetWidth - (row.scrollLeft + row.clientWidth);
    if (overflow > 0 || active.offsetLeft < row.scrollLeft) row.scrollLeft = active.offsetLeft - 8;
  }, [category]);

  return (
    <div className="flex items-start gap-3">
      <span id="library-category-label" className="eyebrow shrink-0 pt-4">
        Category
      </span>
      <div
        ref={rowRef}
        role="group"
        aria-labelledby="library-category-label"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap"
      >
        <Chip active={category === ''} onClick={() => onCategory('')}>
          All
        </Chip>
        {categories
          .filter((c) => c.count > 0)
          .map((c) => (
            <Chip key={c.slug} active={category === c.slug} onClick={() => pick(c.slug)}>
              {c.category}
            </Chip>
          ))}
      </div>
    </div>
  );
}

function SearchInput({
  query,
  resultsId,
  onQuery,
}: Pick<FilterBarProps, 'query' | 'resultsId' | 'onQuery'>) {
  return (
    <div className="relative mt-4">
      <label htmlFor="library-search" className="sr-only">
        Search the library
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-3" />
      <input
        id="library-search"
        type="search"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onQuery('');
        }}
        placeholder="Search: 120 days, undue influence, accounting&hellip;"
        autoComplete="off"
        aria-controls={resultsId}
        className="h-12 w-full rounded-full border border-line-strong bg-white pr-12 pl-12 text-body text-ink placeholder:text-ellipsis placeholder:text-ink-4 focus:border-maroon-700 focus:ring-2 focus:ring-maroon-700/30 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query !== '' && (
        <button
          type="button"
          onClick={() => onQuery('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-1 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-ink-3 transition-colors hover:bg-sand hover:text-ink"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/** Category chips + labeled search input (LIBRARY-SPEC §3.3). */
export function FilterBar({
  categories,
  category,
  query,
  resultsId,
  onCategory,
  onQuery,
}: FilterBarProps) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 sm:p-5">
      <CategoryChips categories={categories} category={category} onCategory={onCategory} />
      <SearchInput query={query} resultsId={resultsId} onQuery={onQuery} />
    </div>
  );
}
