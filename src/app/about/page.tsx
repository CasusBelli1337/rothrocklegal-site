import { HowWeWorkSteps, WhyFasterPanel } from '@/components/home/HowWeWork';
import { JsonLd } from '@/components/seo/JsonLd';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { site } from '@/config/site';
import { getTeamMember } from '@/config/team';
import { webPage } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

/*
 * Minimal shell only. The team builder replaces this page with the full
 * "How we work / credentials" page from content/pages/about.md.
 */

const TITLE = 'About Rothrock Legal – How We Work';
const DESCRIPTION =
  'A small trust and estate litigation firm in San Jose, run by a trial lawyer who also builds ' +
  'litigation software. How we work and why our cases move faster.';
const PATH = '/about/';

export const metadata = pageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
});

export default function AboutPage() {
  const arthur = getTeamMember('arthur-rothrock');
  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-10 lg:py-16">
          <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
          <div className="mt-8 max-w-[52rem]">
            <Eyebrow rule>The firm</Eyebrow>
            <h1 className="mt-4 font-serif text-h1 text-ink">
              A small trust litigation firm in San Jose that answers the phone.
            </h1>
            <p className="mt-6 text-lead text-ink-2">
              Rothrock Legal tries trust and estate cases for families in San Jose and the Bay Area:
              contested trusts and wills, undue influence, trustees who won&rsquo;t account, and
              financial elder abuse. You talk to the people doing the work.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Recognitions">
              {arthur.credentials.map((c) => (
                <li key={c.name}>
                  <Badge wrap>{c.years ? `${c.name} ${c.years}` : c.name}</Badge>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button variant="secondary" href="/attorneys/">
                Meet the team
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="grid-hairline bg-sand py-16 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="How we work" title="Here's what happens when you reach out." />
          </Reveal>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-7">
              <HowWeWorkSteps />
            </Reveal>
            <Reveal className="lg:col-span-5">
              <WhyFasterPanel />
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBand />
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
