import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { Container } from '@/components/ui/Container';
import { FaqAccordion } from '@/components/ui/FaqAccordion';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { homeFaq } from '@/config/faq';

/** HOMEPAGE-SPEC §8: five questions, centered heading, FAQPage JSON-LD. */
export function HomeFaq() {
  return (
    <section className="grid-hairline bg-sand py-16 lg:py-24">
      <Container className="max-w-[52rem]">
        <Reveal>
          <SectionHeading align="center" title="Questions people ask before they reach out." />
        </Reveal>
        <Reveal className="mt-10">
          <FaqAccordion items={homeFaq} />
        </Reveal>
        <p className="mt-8 text-center">
          <Link
            href="/faq/"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-maroon-700 hover:text-maroon-600"
          >
            More questions
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </p>
      </Container>
    </section>
  );
}
