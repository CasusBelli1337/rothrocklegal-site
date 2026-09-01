import { AttorneysStrip } from "@/components/home/AttorneysStrip";
import { ContactBand } from "@/components/home/ContactBand";
import { DeadlineBand } from "@/components/home/DeadlineBand";
import { Hero } from "@/components/home/Hero";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HowWeWork } from "@/components/home/HowWeWork";
import { LibraryPreview } from "@/components/home/LibraryPreview";
import { ProblemCards } from "@/components/home/ProblemCards";
import { Results } from "@/components/home/Results";
import { ServiceArea } from "@/components/home/ServiceArea";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: site.defaultTitle,
  absoluteTitle: true,
  description: site.description,
  path: "/",
});

/** Section order is fixed by HOMEPAGE-SPEC §0. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <DeadlineBand />
      <ProblemCards />
      <AttorneysStrip />
      <HowWeWork />
      <Results />
      <LibraryPreview />
      <HomeFaq />
      <ServiceArea />
      <ContactBand />
    </>
  );
}
