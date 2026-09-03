import { AttorneysStrip } from '@/components/home/AttorneysStrip';
import { ContactBand } from '@/components/home/ContactBand';
import { DeadlineBand } from '@/components/home/DeadlineBand';
import { Hero } from '@/components/home/Hero';
import { HomeFaq } from '@/components/home/HomeFaq';
import { HowWeRunYourCase } from '@/components/home/HowWeRunYourCase';
import { HowWeWork } from '@/components/home/HowWeWork';
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

/** Section order is fixed by HOMEPAGE-SPEC §0; "How we run your case" follows "What to expect" (Arthur, 2026-09-03). */
export default function HomePage() {
  return (
    <>
      <Hero />
      <DeadlineBand />
      <ProblemCards />
      <AttorneysStrip />
      <HowWeWork />
      <HowWeRunYourCase />
      <WhatClientsSay />
      <LibraryPreview />
      <HomeFaq />
      <ServiceArea />
      <ContactBand />
    </>
  );
}
