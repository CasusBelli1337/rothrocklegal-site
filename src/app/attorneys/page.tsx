import type { Metadata } from 'next';
import { TeamGrid } from '@/components/team/TeamGrid';
import { TeamHowWeWork } from '@/components/team/TeamHowWeWork';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { pageMetadata } from '@/lib/seo/metadata';
import type { Crumb } from '@/types/content';

const PATH = '/attorneys/';

export const metadata: Metadata = pageMetadata({
  title: 'Our Attorneys – Trust & Estate Litigation, San Jose',
  description:
    'Meet the Rothrock Legal team: the San Jose trust and estate litigators who take your call, ' +
    'run your case, and try it if it comes to that.',
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
            title="The lawyers who will actually take your call."
            lead="A small firm on purpose. You'll talk to the people doing the work."
            className="mt-8"
          />
        </Container>
      </section>
      <section className="py-16 lg:py-20">
        <Container>
          <TeamGrid headingLevel="h2" />
        </Container>
      </section>
      <TeamHowWeWork />
      <CtaBand />
    </>
  );
}
