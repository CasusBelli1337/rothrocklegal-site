import type { Metadata } from 'next';
import Link from 'next/link';
import { ClientWords } from '@/components/about/ClientWords';
import { HowWeWork } from '@/components/about/HowWeWork';
import { RecognitionSection } from '@/components/about/RecognitionSection';
import { WhatWeDo } from '@/components/about/WhatWeDo';
import { WherePractice } from '@/components/about/WherePractice';
import { JsonLd } from '@/components/seo/JsonLd';
import { TeamGrid } from '@/components/team/TeamGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { site } from '@/config/site';
import { webPage } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';
import type { Crumb } from '@/types/content';

const PATH = '/about/';
const TITLE = 'About Rothrock Legal – How We Work';
const DESCRIPTION =
  'San Jose trust and estate litigators: trust and will contests, trustee disputes, elder ' +
  'financial abuse. AI reads the records; lawyers make every call.';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
});

const trail: Crumb[] = [{ label: 'Home', href: '/' }, { label: 'About' }];

function Hero() {
  return (
    <section className="band-maroon">
      <Container className="py-10 lg:py-16">
        <Breadcrumbs tone="light" trail={trail} />
        <SectionHeading
          as="h1"
          tone="light"
          eyebrow="About Rothrock Legal"
          title="A trust and estate litigation firm built for the way cases are won now."
          lead="We represent the people who get hurt when a trust or estate goes wrong: the daughter cut out by a late amendment, the brother whose co-trustee sibling won't show the books. San Jose, Santa Clara County, and the Bay Area."
          className="mt-8 max-w-[52rem]"
        />
      </Container>
    </section>
  );
}

function WhoWeAre() {
  return (
    <section className="py-16 lg:py-20">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Who we are"
            title="Small on purpose."
            lead="You'll talk to the people doing the work, not an intake desk."
          />
          <Link
            href="/attorneys/"
            className="tap-link shrink-0 text-small font-medium text-maroon-700 underline-offset-3 hover:underline"
          >
            Meet the team <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <div className="mt-6 max-w-[64ch] space-y-4 text-body-lg text-ink-2">
          <p>
            Here&rsquo;s how the work gets divided. Arthur sets the strategy and keeps the big
            picture on every case. Jonathan Joannides, a former Marine Corps infantry captain who
            practiced at Wilson Sonsini and Fenwick &amp; West and now serves as President of the
            Honorable William A. Ingram American Inn of Court, takes the depositions and argues the
            hearings. Gerry Lin and Max Discher, our associates, execute the plan: the records, the
            discovery, the drafting.
          </p>
          <p>
            The point is simple. Senior judgment where it counts, a courtroom presence the judges
            know, and associate rates for the heavy lifting.
          </p>
        </div>
        <div className="mt-10">
          <TeamGrid />
        </div>
      </Container>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <Hero />
      <WhatWeDo />
      <HowWeWork />
      <WhoWeAre />
      <RecognitionSection />
      <WherePractice />
      <ClientWords />
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
