import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { asset } from '@/config/site';
import { formatShortDate } from '@/lib/library/dates';
import type { LibraryListItem } from '@/lib/library/index-item';
import { Highlight } from './Highlight';
import type { SnippetResult } from './searchUtils';

function Separator() {
  return (
    <span aria-hidden="true" className="text-ink-4">
      |
    </span>
  );
}

/**
 * "DEADLINES | SEP 1, 2026 | 6 MIN READ" meta row shared by the cards. Long
 * category names wrap the row at three columns, so the only break allowed is
 * after "CATEGORY |": the second line is always "DATE | READ TIME".
 */
export function CardMeta({ item }: { item: LibraryListItem }) {
  return (
    <p className="eyebrow flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="flex items-center gap-x-2 whitespace-nowrap">
        {item.category}
        <Separator />
      </span>
      <span className="flex items-center gap-x-2 whitespace-nowrap text-ink-3">
        {formatShortDate(item.date)}
        <Separator />
        {item.readTime} min read
      </span>
    </p>
  );
}

function Snippet({ snippet, bodyHits }: { snippet: SnippetResult; bodyHits: number }) {
  return (
    <div className="mt-2 border-l-2 border-brass-400 pl-3">
      <p className="line-clamp-3 text-small text-ink-2">
        {snippet.truncatedStart && <span className="text-ink-4">&hellip; </span>}
        <Highlight text={snippet.text} ranges={snippet.matches} />
        {snippet.truncatedEnd && <span className="text-ink-4"> &hellip;</span>}
      </p>
      {bodyHits > 1 && (
        <p className="mt-1.5 text-meta text-maroon-700">{bodyHits} matches in article</p>
      )}
    </div>
  );
}

interface LibraryCardProps {
  item: LibraryListItem;
  /** Search terms to highlight in the title and excerpt. */
  terms?: readonly string[];
  /** Body-text snippet shown instead of the excerpt when the search hit the body. */
  snippet?: SnippetResult | null;
  bodyHits?: number;
  priority?: boolean;
  headingLevel?: 'h2' | 'h3' | 'h4';
}

/**
 * Article card (LIBRARY-SPEC §4): whole card is one link; the title is its
 * accessible name. The one card for the library index, the homepage preview,
 * practice-page related reading, and article related rows.
 */
export function LibraryCard({
  item,
  terms = [],
  snippet = null,
  bodyHits = 0,
  priority,
  headingLevel: Tag = 'h3',
}: LibraryCardProps) {
  return (
    <Link
      href={`/library/${item.slug}/`}
      className="group flex h-full flex-col overflow-hidden border border-line bg-white transition-colors duration-150 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-500"
    >
      <div className="relative aspect-[16/7] overflow-hidden bg-sand">
        <Image
          src={asset(item.image)}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <CardMeta item={item} />
        <Tag className="mt-3 line-clamp-3 font-sans text-h4 text-ink transition-colors group-hover:text-maroon-700">
          <Highlight text={item.title} terms={terms} />
        </Tag>
        {snippet ? (
          <Snippet snippet={snippet} bodyHits={bodyHits} />
        ) : (
          <p className="mt-2 line-clamp-2 text-small text-ink-2">
            <Highlight text={item.excerpt} terms={terms} />
          </p>
        )}
        {item.draft && (
          <div className="mt-auto pt-4">
            <Badge>Draft &ndash; pending attorney review</Badge>
          </div>
        )}
      </div>
    </Link>
  );
}
