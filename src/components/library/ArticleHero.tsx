import Image from 'next/image';
import Link from 'next/link';
import { hasHeadshot } from '@/components/layout/TeamCard';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { InitialAvatar } from '@/components/ui/InitialAvatar';
import { asset } from '@/config/site';
import { teamHref, type TeamMember } from '@/config/team';
import { formatDate } from '@/lib/format-date';
import type { LibraryArticle } from '@/lib/library/articles';

/** Title size steps by length like Legion's hero (LIBRARY-SPEC §6.1). */
function titleSize(title: string): string {
  if (title.length <= 40) return 'text-display';
  if (title.length <= 80) return 'text-h1';
  return 'text-h2';
}

function Dot() {
  return (
    <span aria-hidden="true" className="text-white/40">
      &middot;
    </span>
  );
}

function ArticleMeta({ article, author }: { article: LibraryArticle; author: TeamMember }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-3 text-small text-white/80">
      <Link href={teamHref(author)} className="flex items-center gap-3 text-white hover:underline">
        {hasHeadshot(author) ? (
          <Image
            src={asset(author.image.small)}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover object-top"
          />
        ) : (
          <InitialAvatar name={author.name} size="sm" className="h-10 w-10 rounded-full" />
        )}
        <span>
          By <span className="font-semibold">{author.name}</span>
          <span className="text-white/70">, {author.title}</span>
        </span>
      </Link>
      <Dot />
      <time dateTime={article.date}>{formatDate(article.date)}</time>
      {article.updated !== article.date && (
        <>
          <Dot />
          <span>
            Updated <time dateTime={article.updated}>{formatDate(article.updated)}</time>
          </span>
        </>
      )}
      <Dot />
      <span>{article.readTime} min read</span>
    </div>
  );
}

/** Maroon hero: breadcrumb, category, title, byline, cover on the right at lg. */
export function ArticleHero({ article, author }: { article: LibraryArticle; author: TeamMember }) {
  return (
    <section className="band-maroon py-10 lg:py-14">
      <Container>
        <Breadcrumbs
          tone="light"
          trail={[
            { label: 'Home', href: '/' },
            { label: 'Library', href: '/library/' },
            { label: article.title },
          ]}
        />
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <Eyebrow tone="light" rule>
              <Link
                href={`/library/?category=${article.categorySlug}`}
                className="transition-colors hover:text-white"
              >
                {article.category}
              </Link>
            </Eyebrow>
            <h1 className={`mt-4 font-serif ${titleSize(article.title)} text-white`}>
              {article.title}
            </h1>
            <ArticleMeta article={article} author={author} />
            {article.draft && (
              <Badge tone="dark" className="mt-6">
                Draft &ndash; pending attorney review
              </Badge>
            )}
          </div>
          <div className="hidden lg:col-span-5 lg:block">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-white/15">
              <Image
                src={asset(article.image)}
                alt={article.imageAlt}
                width={1200}
                height={675}
                priority
                sizes="(min-width: 1024px) 480px, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
