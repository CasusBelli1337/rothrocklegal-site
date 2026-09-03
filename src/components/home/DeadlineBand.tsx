import { renderVariants, Slot } from '@/components/lens/Slot';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { PhotoCorners } from '@/components/ui/PhotoCorners';
import { Reveal } from '@/components/ui/Reveal';
import { lensCopy, type LensLink } from '@/config/lens-copy';
import { renderDeadlineCards } from './deadline-cards';

const primary = renderVariants(lensCopy.deadlineCta, (link: LensLink) => (
  <Button href={link.href}>{link.label}</Button>
));
const secondary = renderVariants(lensCopy.deadlineSecondary, (link: LensLink) => (
  <Button variant="secondary" href={link.href}>
    {link.label}
  </Button>
));
const cards = renderVariants(lensCopy.deadlineCards, renderDeadlineCards);

/**
 * HOMEPAGE-SPEC §2: one white tile on sand, square-cornered and held by brass
 * photo mounts (Arthur, 2026-09-03). A hook question, the three clocks, a
 * teaser for the visitor who fears it is already too late, then the two
 * buttons. Every piece of copy is a lens slot; the card set is one slot so a
 * framing swaps whole.
 */
export function DeadlineBand() {
  return (
    <section className="grid-hairline bg-sand py-16 lg:py-24">
      <Container>
        <Reveal>
          <div className="relative rounded-none border border-line bg-white p-6 sm:p-8 lg:p-12">
            <PhotoCorners />
            <Eyebrow>
              <Slot name="deadline-eyebrow" variants={lensCopy.deadlineEyebrow} />
            </Eyebrow>
            <h2 className="mt-3 font-serif text-h2 text-ink">
              <Slot name="deadline-title" variants={lensCopy.deadlineTitle} />
            </h2>
            <p className="mt-4 max-w-[60ch] text-lead text-ink-2">
              <Slot name="deadline-lead" variants={lensCopy.deadlineLead} />
            </p>
            <Slot name="deadline-cards" as="div" className="mt-10" variants={cards} />
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Slot name="deadline-cta" variants={primary} className="contents" />
              <Slot name="deadline-secondary" variants={secondary} className="contents" />
            </div>
            <p className="mt-5 text-small text-ink-3">
              General information, not legal advice. Deadlines depend on your facts and change
              &ndash; confirm yours with a lawyer.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
