import { Container } from '@/components/ui/Container';
import { proofPoints } from '@/config/proof-points';

/**
 * A quiet row of six verifiable facts between the hero and the deadline band
 * (show, not tell; Arthur, 2026-09-02). Plain text with hairline separators:
 * no icons, no badges beyond the ones the hero already carries.
 */
export function ProofStrip() {
  const points = proofPoints();
  return (
    <section aria-label="Arthur Rothrock's record" className="border-b border-line bg-paper">
      <Container className="py-5 lg:py-6">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3 xl:grid-cols-6 xl:gap-x-8">
          {points.map((point) => (
            <li
              key={point}
              className="border-l border-line-strong pl-3 text-small leading-snug text-ink-2"
            >
              {point}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
