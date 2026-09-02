import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { practiceHref, practicePages, primaryPractices } from '@/config/practice-areas';
import { oddLastSpan } from '@/lib/grid';

/** Hub-and-spoke grid on /trust-litigation/ (SEO-SPEC §9): the primary pages as cards, business as a line. */
export function PracticeGrid() {
  const secondary = practicePages.filter((a) => a.secondary);
  return (
    <section className="grid-hairline bg-sand py-16 lg:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="What we handle"
            title="Which of these sounds like your family?"
          />
        </Reveal>
        <Reveal stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {primaryPractices.map((area, i) => (
            <Card
              key={area.slug}
              href={practiceHref(area)}
              className={`flex h-full flex-col ${oddLastSpan(i, primaryPractices.length, 'lg')}`}
            >
              <h3 className="font-sans text-h4 text-ink">{area.title}</h3>
              <p className="mt-2 flex-1 text-small text-ink-3">{area.headline}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-maroon-700">
                What you can do
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </p>
            </Card>
          ))}
        </Reveal>
        {secondary.map((area) => (
          <p key={area.slug} className="mt-8 text-small text-ink-3">
            Business or partnership dispute instead?{' '}
            <Link
              href={practiceHref(area)}
              className="font-medium text-maroon-700 underline underline-offset-3"
            >
              We handle those too.
            </Link>
          </p>
        ))}
      </Container>
    </section>
  );
}
