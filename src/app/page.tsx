import { AttorneysStrip } from '@/components/home/AttorneysStrip';
import { ContactBand } from '@/components/home/ContactBand';
import { DeadlineBand } from '@/components/home/DeadlineBand';
import { Hero } from '@/components/home/Hero';
import { HomeFaq } from '@/components/home/HomeFaq';
import { HowWeWork } from '@/components/home/HowWeWork';
import { LegionLitigator } from '@/components/home/LegionLitigator';
import { LibraryPreview } from '@/components/home/LibraryPreview';
import { ProblemCards } from '@/components/home/ProblemCards';
import { ServiceArea } from '@/components/home/ServiceArea';
import { WhatClientsSay } from '@/components/home/WhatClientsSay';
import { site } from '@/config/site';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: site.defaultTitle,
  absoluteTitle: true,
  description: site.description,
  path: '/',
});

/**
 * Section order is fixed by HOMEPAGE-SPEC §0. The Legion Litigator section
 * follows "What to expect" where "How we run your case" used to be; that
 * section previewed how the firm divides its work, which Arthur cut on
 * 2026-09-04.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <DeadlineBand />
      <ProblemCards />
      <AttorneysStrip />
      <HowWeWork />
      <LegionLitigator />
      <WhatClientsSay />
      <LibraryPreview />
      <HomeFaq />
      <ServiceArea />
      <ContactBand />
    </>
  );
}
