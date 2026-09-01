import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { asset } from "@/config/site";
import type { LibraryPreviewItem } from "@/lib/library/preview";
import { formatDate } from "@/lib/format-date";

interface ArticleCardProps {
  item: LibraryPreviewItem;
  priority?: boolean;
  headingLevel?: "h3" | "h4";
}

/**
 * Library card (LIBRARY-SPEC §4): 16:7 image or monogram panel, meta row,
 * title, excerpt, draft chip. The library builder extends this with the
 * search snippet + highlight props rather than adding a second card.
 */
export function ArticleCard({
  item,
  priority,
  headingLevel: Tag = "h3",
}: ArticleCardProps) {
  return (
    <Link
      href={`/library/${item.slug}/`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-[box-shadow,border-color] duration-150 hover:border-maroon-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-500"
    >
      <div className="relative aspect-[16/7] overflow-hidden bg-maroon-100">
        {item.image ? (
          <Image
            src={asset(item.image)}
            alt={item.imageAlt ?? ""}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Image
              src={asset("/images/logo.webp")}
              alt=""
              width={96}
              height={70}
              className="h-14 w-auto opacity-80"
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow flex flex-wrap items-center gap-x-2">
          <span>{item.category}</span>
          <span className="text-ink-4" aria-hidden="true">
            |
          </span>
          <span className="text-ink-3">{formatDate(item.date)}</span>
          <span className="text-ink-4" aria-hidden="true">
            |
          </span>
          <span className="text-ink-3">{item.readingTime} min read</span>
        </p>
        <Tag className="mt-3 font-sans text-h4 text-ink transition-colors group-hover:text-maroon-700">
          {item.title}
        </Tag>
        <p className="mt-2 line-clamp-2 text-small text-ink-2">
          {item.excerpt}
        </p>
        {item.draft && (
          <div className="mt-4">
            <Badge>Draft – pending attorney review</Badge>
          </div>
        )}
      </div>
    </Link>
  );
}
