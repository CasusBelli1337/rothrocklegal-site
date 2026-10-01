import type { Metadata } from 'next';
import { TeamGrid } from '@/components/team/TeamGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { JsonLd } from '@/components/seo/JsonLd';
import { team, teamHref } from '@/config/team';
import { collectionPage } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';
import type { Crumb } from '@/types/content';

const PATH = '/attorneys/';
const TITLE = 'Our Attorneys – Trust & Estate Litigation, San Jose';
const DESCRIPTION =
  'Meet the Rothrock Legal team: the San Jose trust and estate litigators who read your ' +
  'consult request and work your case.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

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
          <TeamGrid headingLevel="h2" />
        </Container>
      </section>
      <CtaBand />
      <JsonLd
        data={collectionPage({
          path: PATH,
          title: TITLE,
          description: DESCRIPTION,
          items: team.map((m) => ({ path: teamHref(m), name: m.name })),
        })}
      />
    </>
  );
}
