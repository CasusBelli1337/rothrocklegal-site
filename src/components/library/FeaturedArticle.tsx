import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { asset } from '@/config/site';
import type { LibraryListItem } from '@/lib/library/index-item';
import { CardMeta } from './LibraryCard';

interface FeaturedArticleProps {
  item: LibraryListItem;
  /** Preload the image; off for a lens variant that is hidden by default. */
  priority?: boolean;
}

/** The highlight card at the top of the library (LIBRARY-SPEC §3.2). */
export function FeaturedArticle({ item, priority = true }: FeaturedArticleProps) {
  return (
    <Link
      href={`/library/${item.slug}/`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-[box-shadow,border-color] duration-150 hover:border-maroon-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-500"
    >
      <div className="relative aspect-[16/7] overflow-hidden bg-maroon-100">
        <Image
          src={asset(item.image)}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 720px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <Eyebrow rule>Featured</Eyebrow>
        <h2 className="mt-3 font-serif text-h3 text-ink transition-colors group-hover:text-maroon-700 lg:text-h2">
          {item.title}
        </h2>
        <p className="mt-3 max-w-[60ch] text-body text-ink-2">{item.excerpt}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
          <CardMeta item={item} />
          {item.draft && <Badge>Draft &ndash; pending attorney review</Badge>}
        </div>
      </div>
    </Link>
  );
}
