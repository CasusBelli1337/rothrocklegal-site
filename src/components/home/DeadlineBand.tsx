import { renderVariants, Slot } from '@/components/lens/Slot';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { PhotoCorners } from '@/components/ui/PhotoCorners';
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
 * photo mounts (Arthur, 2026-09-03). The hook question alone at the top, no
 * eyebrow or lead above the clocks (Arthur, 2026-09-03: "filler words"), then
 * the three clocks, a teaser for the visitor who fears it is already too late,
 * and the two buttons. Every piece of copy is a lens slot; the card set is one
 * slot so a framing swaps whole.
 */
export function DeadlineBand() {
  return (
    <section className="grid-hairline bg-sand py-16 lg:py-24">
      <Container>
        <div>
          <div className="relative border border-line bg-white p-6 sm:p-8 lg:p-12">
            <PhotoCorners />
            <h2 className="font-serif text-h2 text-ink">
              <Slot name="deadline-title" variants={lensCopy.deadlineTitle} />
            </h2>
            <Slot name="deadline-cards" as="div" className="mt-8" variants={cards} />
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Slot name="deadline-cta" variants={primary} className="contents" />
              <Slot name="deadline-secondary" variants={secondary} className="contents" />
            </div>
            <p className="mt-5 text-small text-ink-3">
              General information, not legal advice. Deadlines depend on your facts and change
              &ndash; confirm yours with a lawyer.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
