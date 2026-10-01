import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { firstName, type TeamExternalArticle, type TeamMember } from '@/config/team';
import { getArticles, type LibraryArticle } from '@/lib/library/articles';
import { articlesByMember, elsewhereByMember } from '@/lib/library/by-author';

/** Rows are whole-width links, 44px+ on touch, titles underlined at rest (docs/MOBILE.md). */
const rowLink = 'group tap-row py-3';
const rowTitle =
  'block font-sans text-body font-semibold text-ink underline decoration-line-strong ' +
  'underline-offset-3 transition-colors group-hover:text-maroon-700 group-hover:decoration-current';
const rowMeta = 'mt-1 block text-meta text-ink-3';
/** Two columns from md, filled top to bottom so the configured order reads down the left first. */
const listClass = 'mt-8 border-t border-line md:columns-2 md:gap-x-12';
const itemClass = 'break-inside-avoid border-b border-line';

function LibraryRows({ articles }: { articles: readonly LibraryArticle[] }) {
  return (
    <ol className={listClass}>
      {articles.map((article) => (
        <li key={article.slug} className={itemClass}>
          <Link href={`/library/${article.slug}/`} className={rowLink}>
            <span>
              <span className={rowTitle}>{article.title}</span>
              <span className={rowMeta}>{article.category}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function ElsewhereRows({ items }: { items: readonly TeamExternalArticle[] }) {
  return (
    <ul className={listClass}>
      {items.map((item) => (
        <li key={item.url} className={itemClass}>
          <a href={item.url} rel="noopener" className={rowLink}>
            <span>
              <span className={rowTitle}>{item.title}</span>
              <span className={rowMeta}>{item.outlet}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Elsewhere({ name, items }: { name: string; items: readonly TeamExternalArticle[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-14">
      <h3 id="writing-elsewhere" className="font-serif text-h3 text-ink">
        Elsewhere
      </h3>
      <p className="mt-2 max-w-[60ch] text-body text-ink-2">
        Guides {name} writes for other lawyers.
      </p>
      <ElsewhereRows items={items} />
    </div>
  );
}

/**
 * "Articles by …" on a bio page, driven by `member.writing`: the library articles
 * by this person (configured order first, then newest; drafts never), a count line
 * with "See all articles", then their pieces on other sites.
 */
export function ArticlesByMember({ member }: { member: TeamMember }) {
  if (!member.writing) return null;
  const all = articlesByMember(member);
  const shown = all.slice(0, member.writing.shown);
  const elsewhere = elsewhereByMember(member);
  if (shown.length === 0 && elsewhere.length === 0) return null;
  const name = firstName(member);
  const wroteAll = all.length === getArticles({ includeDrafts: false }).length;
  return (
    <section className="pb-14 lg:pb-20" aria-labelledby="writing">
      <Container>
        <div className="border-t border-line pt-14 lg:pt-16">
          <SectionHeading
            id="writing"
            eyebrow={`Articles by ${name}`}
            title={
              wroteAll ? `${name} wrote every article in our library.` : `What ${name} has written.`
            }
          />
          <LibraryRows articles={shown} />
          <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-ink-2">
            <span>
              {shown.length} of {all.length} articles, the questions families ask first at the top.
            </span>
            <Link
              href="/library/"
              className="tap-link inline-flex items-center gap-1.5 font-semibold text-maroon-700 underline underline-offset-3 hover:text-maroon-600"
            >
              See all articles
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </p>
          <Elsewhere name={name} items={elsewhere} />
        </div>
      </Container>
    </section>
  );
}
