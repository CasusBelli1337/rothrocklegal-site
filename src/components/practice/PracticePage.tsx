import { JsonLd } from '@/components/seo/JsonLd';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { DeadlineCallout } from '@/components/ui/DeadlineCallout';
import { FaqAccordion } from '@/components/ui/FaqAccordion';
import { Reveal } from '@/components/ui/Reveal';
import { getPracticeArea, practiceHref } from '@/config/practice-areas';
import { getPracticeBody } from '@/lib/practice';
import { pageMetadata } from '@/lib/seo/metadata';
import { webPage } from '@/lib/seo/jsonld';
import { PracticeGrid } from './PracticeGrid';
import { PracticeHero } from './PracticeHero';
import { PracticeSidebar } from './PracticeSidebar';
import { RelatedReading } from './RelatedReading';

export function practiceMetadata(slug: string) {
  const area = getPracticeArea(slug);
  return pageMetadata({
    title: area.seoTitle,
    description: area.description,
    path: practiceHref(area),
  });
}

const DISCLAIMER =
  'This page is general information, not legal advice, and reading it does not make you a client ' +
  'of Rothrock Legal. No attorney-client relationship exists until an engagement letter is signed. ' +
  'Deadlines depend on your facts and change; confirm yours with a lawyer.';

/** One template for the hub and the eight spoke pages (IA.md §1, SEO-SPEC §8). */
export function PracticePage({ slug }: { slug: string }) {
  const area = getPracticeArea(slug);
  const sections = getPracticeBody(slug);
  const path = practiceHref(area);
  return (
    <>
      <PracticeHero area={area} />
      {area.hub && <PracticeGrid />}
      <Container className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-16 lg:py-20">
        <article className="lg:col-span-8">
          <div className="prose-article">
            {sections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-h`}>
                <h2 id={`${section.id}-h`}>{section.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: section.html }} />
              </section>
            ))}
          </div>
          <Reveal className="mt-14">
            <DeadlineCallout
              eyebrow="Am I too late?"
              title="How long do I have?"
              body={area.deadline.body}
              finePrint="General information, not legal advice. Confirm your dates with a lawyer."
            />
          </Reveal>
          <section className="mt-16" aria-labelledby="practice-faq">
            <h2 id="practice-faq" className="font-serif text-h2 text-ink">
              Questions people ask about {area.title.toLowerCase()}
            </h2>
            <FaqAccordion items={area.faq} className="mt-8" />
          </section>
          <p className="mt-12 border-t border-line pt-6 text-small text-ink-3">{DISCLAIMER}</p>
        </article>
        <PracticeSidebar area={area} sections={sections} />
      </Container>
      <RelatedReading area={area} />
      <CtaBand
        title={<>Tell us what happened.</>}
        lead={
          <>A few sentences is enough. We&rsquo;ll read it, check the clock, and call you back.</>
        }
      />
      <JsonLd
        data={webPage({
          path,
          title: area.seoTitle,
          description: area.description,
          updated: area.updatedAt,
        })}
      />
    </>
  );
}
