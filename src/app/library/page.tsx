import type { Metadata } from 'next';
import { FeaturedArticle } from '@/components/library/FeaturedArticle';
import { LibraryClient } from '@/components/library/LibraryClient';
import { WizardCard } from '@/components/library/WizardCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getArticles, getCategoriesWithCounts, getFeatured } from '@/lib/library/articles';
import { toListItem } from '@/lib/library/index-item';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'The Library – Trust & Estate Answers in Plain English',
  description:
    'Plain-English answers about deadlines, trust and will contests, undue influence, trustees, and elder financial abuse from Rothrock Legal in San Jose.',
  path: '/library/',
});

export default function LibraryPage() {
  const items = getArticles().map(toListItem);
  const featured = getFeatured();
  const categories = getCategoriesWithCounts();
  console.log(`library page: ${items.length} cards, featured ${featured?.slug ?? 'none'}`);
  return (
    <>
      <section className="band-maroon py-14 lg:py-20">
        <Container>
          <Breadcrumbs tone="light" trail={[{ label: 'Home', href: '/' }, { label: 'Library' }]} />
          <SectionHeading
            as="h1"
            tone="light"
            eyebrow="Library"
            title={
              <>
                Straight answers about trusts, wills, and the <em className="em-word">fights</em>{' '}
                that follow.
              </>
            }
            lead={
              <>
                Deadlines, trust contests, accountings, elder financial abuse, and what to do when
                you are the trustee being accused &ndash; written in plain English by the lawyers
                who handle these cases in San Jose.
              </>
            }
            className="mt-8"
          />
        </Container>
      </section>

      <section className="bg-sand py-12 lg:py-16">
        <Container>
          <Reveal className="grid gap-6 lg:grid-cols-5">
            {featured && (
              <div className="lg:col-span-3">
                <FeaturedArticle item={toListItem(featured)} />
              </div>
            )}
            <div className={featured ? 'lg:col-span-2' : 'lg:col-span-5'}>
              <WizardCard />
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container>
          <LibraryClient items={items} categories={categories} />
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
