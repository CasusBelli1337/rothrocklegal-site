import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { FaqAccordion } from '@/components/ui/FaqAccordion';
import { allFaqItems, faqGroups } from '@/config/faq';
import { site } from '@/config/site';
import { faqPage, webPage } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'Trust & Estate Litigation FAQ – Costs, Deadlines, Courts';
const DESCRIPTION =
  'What it costs to contest a trust or will, how long you have, how long cases take, and which ' +
  'courts hear these cases. Plain-English answers from San Jose.';
const PATH = '/faq/';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function FaqPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-10 lg:py-16">
          <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />
          <div className="mt-8 max-w-[52rem]">
            <Eyebrow rule>Questions</Eyebrow>
            <h1 className="mt-4 font-serif text-h1 text-ink">
              The questions people ask before they reach out.
            </h1>
            <p className="mt-6 text-lead text-ink-2">
              Costs, deadlines, what the process looks like, and where cases are heard. If yours is not
              here, ask it in your consult request.
            </p>
          </div>
        </Container>
      </section>

      <Container className="max-w-[52rem] py-16 lg:py-20">
        <div className="space-y-14">
          {faqGroups.map((group) => (
            <section key={group.title} aria-labelledby={`faq-${group.title}`}>
              <h2 id={`faq-${group.title}`} className="font-serif text-h2 text-ink">
                {group.title}
              </h2>
              <FaqAccordion items={group.items} jsonLd={false} className="mt-6" />
            </section>
          ))}
        </div>
      </Container>

      <CtaBand
        title="Still have a question?"
        lead={
          <>
            Ask it in your consult request. The first conversation is about your dates and your
            documents, not a pitch.
          </>
        }
      />
      <JsonLd data={faqPage(allFaqItems)} />
      <JsonLd
        data={webPage({
          path: PATH,
          title: TITLE,
          description: DESCRIPTION,
          updated: site.lastUpdated,
        })}
      />
    </>
  );
}
