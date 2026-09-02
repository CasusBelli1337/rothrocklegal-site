import type { Metadata } from 'next';
import { TeamGrid } from '@/components/team/TeamGrid';
import { TeamHowWeWork } from '@/components/team/TeamHowWeWork';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { pageMetadata } from '@/lib/seo/metadata';
import type { Crumb } from '@/types/content';

const PATH = '/attorneys/';

export const metadata: Metadata = pageMetadata({
  title: 'Our Attorneys – Trust & Estate Litigation, San Jose',
  description:
    'Meet the Rothrock Legal team: the San Jose trust and estate litigators who read your ' +
    'consult request, run your case, and try it if it comes to that.',
  path: PATH,
});

const trail: Crumb[] = [{ label: 'Home', href: '/' }, { label: 'Attorneys' }];

export default function AttorneysPage() {
  return (
    <>
      <section className="band-maroon">
        <Container className="py-10 lg:py-16">
          <Breadcrumbs tone="light" trail={trail} />
          <SectionHeading
            as="h1"
            tone="light"
            eyebrow="The team"
            title="The lawyers who will actually work your case."
            lead="A small firm on purpose. You'll talk to the people doing the work."
            className="mt-8"
          />
        </Container>
      </section>
      <section className="py-16 lg:py-20">
        <Container>
          <Reveal className="max-w-[64ch] text-body-lg text-ink-2">
            <p>
              Four lawyers, one plan per case. Arthur sets the strategy and the big picture.
              Jonathan handles the depositions and the hearings: a former Marine Corps infantry
              captain who practiced at Wilson Sonsini and Fenwick &amp; West and is now President of
              the Honorable William A. Ingram American Inn of Court. Gerry and Max are the
              associates who execute the plan: the records, the discovery, the drafting. You get
              senior judgment where it matters, a courtroom presence judges know, and lower rates
              for the heavy lifting.
            </p>
          </Reveal>
          <div className="mt-10">
            <TeamGrid headingLevel="h2" />
          </div>
        </Container>
      </section>
      <TeamHowWeWork />
      <CtaBand />
    </>
  );
}
