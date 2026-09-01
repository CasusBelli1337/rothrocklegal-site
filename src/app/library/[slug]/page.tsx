import type { Metadata } from 'next';
import { ArticleBody } from '@/components/library/ArticleBody';
import { ArticleHero } from '@/components/library/ArticleHero';
import { ArticleToc } from '@/components/library/ArticleToc';
import { AuthorBox } from '@/components/library/AuthorBox';
import { RelatedArticles } from '@/components/library/RelatedArticles';
import { WizardCard } from '@/components/library/WizardCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { getTeamMember, teamHref } from '@/config/team';
import {
  TECH_CATEGORY,
  getArticle,
  getArticles,
  getRelated,
  type LibraryArticle,
} from '@/lib/library/articles';
import { toListItem } from '@/lib/library/index-item';
import { absoluteUrl, article as articleJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

interface Params {
  slug: string;
}

const PACIFIC = 'T00:00:00-07:00';

export function generateStaticParams(): Params[] {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  const author = getTeamMember(article.author);
  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/library/${article.slug}/`,
    image: article.image,
    imageAlt: article.imageAlt,
    type: 'article',
    noindex: article.draft,
    article: {
      publishedTime: `${article.date}${PACIFIC}`,
      modifiedTime: `${article.updated}${PACIFIC}`,
      authors: [absoluteUrl(teamHref(author))],
      section: article.category,
      tags: article.tags,
    },
  });
}

function jsonLd(article: LibraryArticle, authorName: string) {
  return articleJsonLd({
    slug: article.slug,
    title: article.title,
    description: article.description,
    image: article.image,
    date: article.date,
    updated: article.updated,
    authorSlug: article.author,
    authorName,
    category: article.category,
    tags: article.tags,
    legacy: article.category === TECH_CATEGORY,
  });
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  const author = getTeamMember(article.author);
  const toc = article.toc.filter((h) => h.level === 2);
  const related = getRelated(article, 3).map(toListItem);
  return (
    <>
      <ArticleHero article={article} author={author} />
      <Container className="py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-8">
            {toc.length > 0 && <ArticleToc entries={toc} variant="mobile" />}
            <div className={toc.length > 0 ? 'mt-8 lg:mt-0' : ''}>
              <ArticleBody article={article} />
            </div>
            <AuthorBox member={author} />
          </div>
          <aside className="lg:col-span-4" aria-label="On this page and deadlines">
            <div className="space-y-8 lg:sticky lg:top-24">
              {toc.length > 0 && <ArticleToc entries={toc} variant="sidebar" />}
              <WizardCard
                size="md"
                title="Worried about a deadline?"
                lead="Check it in two minutes. Answer four questions and see which California deadlines may apply to you."
              />
            </div>
          </aside>
        </div>
      </Container>
      <RelatedArticles items={related} />
      <CtaBand
        title="Talk to a trust litigation lawyer in San Jose."
        lead="Tell us what happened. We will read it, check the clock, and call you back."
      />
      {!article.draft && <JsonLd data={jsonLd(article, author.name)} />}
    </>
  );
}
