import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { renderVariants, Slot } from '@/components/lens/Slot';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { DeadlineCallout } from '@/components/ui/DeadlineCallout';
import { Reveal } from '@/components/ui/Reveal';
import { lensCopy, type LensLink } from '@/config/lens-copy';

const ctaVariants = renderVariants(lensCopy.deadlineCta, (link: LensLink) => (
  <Button href={link.href}>{link.label}</Button>
));

/** HOMEPAGE-SPEC §2: the wizard callout on sand, 8 + 4 columns. Copy and the button are lens slots. */
export function DeadlineBand() {
  return (
    <section className="grid-hairline bg-sand py-16 lg:py-24">
      <Container className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-8">
          <DeadlineCallout
            eyebrow={<Slot name="deadline-eyebrow" variants={lensCopy.deadlineEyebrow} />}
            headingLevel="h2"
            title={<Slot name="deadline-title" variants={lensCopy.deadlineTitle} />}
            body={<Slot name="deadline-body" variants={lensCopy.deadlineBody} />}
            action={<Slot name="deadline-cta" variants={ctaVariants} className="contents" />}
            secondary={
              <Slot
                name="deadline-secondary"
                variants={lensCopy.deadlineSecondary}
                linkClassName="font-semibold text-maroon-700 underline underline-offset-3"
              />
            }
            finePrint={
              <>
                General information, not legal advice. Deadlines depend on your facts and change
                &ndash; confirm yours with a lawyer.
              </>
            }
          />
        </Reveal>
        <Reveal className="lg:col-span-4 lg:pt-6">
          <h3 className="font-sans text-h4 text-ink">What counts as notice?</h3>
          <p className="mt-3 text-body text-ink-2">
            A written notice from the trustee saying the trust has become irrevocable, giving the
            trustee&rsquo;s name and address, and warning that you have 120 days to contest it
            (Probate Code &sect; 16061.7). It usually arrives by mail, with or without a copy of the
            trust.
          </p>
          <Link
            href="/library/?category=deadlines"
            className="tap-link mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-maroon-700 hover:text-maroon-600"
          >
            Read about the 120-day rule
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
