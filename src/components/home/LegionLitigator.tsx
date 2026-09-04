import Link from 'next/link';
import { Commitments } from '@/components/legion/Commitments';
import { LegionLitigatorSeal } from '@/components/legion/LegionLitigatorSeal';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { legionLitigator } from '@/config/legion-litigator';

/**
 * The Legion Litigator section (Arthur, 2026-09-04), in the slot "How we run
 * your case" held: the seal, what the designation means for the family's case,
 * the four commitments, and a link to the fuller account on the About page.
 * It speaks to the family, never to other lawyers.
 */
export function LegionLitigator() {
  const { eyebrow, title, lead, link } = legionLitigator.home;
  return (
    <section className="bg-white py-16 lg:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="flex justify-center lg:col-span-4">
            <LegionLitigatorSeal className="w-64 max-w-full lg:w-80" />
          </div>
          <div className="lg:col-span-8">
            <SectionHeading eyebrow={eyebrow} title={title} lead={lead} />
            <div className="mt-8">
              <Commitments />
            </div>
            <p className="mt-8">
              <Link
                href={link.href}
                className="tap-link text-small font-medium text-maroon-700 underline-offset-3 hover:underline"
              >
                {link.label} <span aria-hidden="true">&rarr;</span>
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
