import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cities, citiesIn, courts, listNames, regions } from '@/config/service-areas';

/** Courts and cities from service-areas.ts; one link to /service-areas/ (HOMEPAGE-SPEC §9). */
export function WherePractice() {
  const cityNames = cities.map((c) => c.name).join(', ');
  const regionNames = regions.slice(0, -1).join(', ');
  const sanMateo = listNames(citiesIn('San Mateo County'));
  const alameda = listNames(citiesIn('Alameda County'));
  return (
    <section className="py-16 lg:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Service area"
            title="San Jose first. The whole Bay Area when the case calls for it."
            lead="We meet by video anywhere in California and appear in person in the courtrooms below."
          />
        </Reveal>
        <Reveal stagger className="mt-10 grid gap-8 md:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="font-sans text-h4 text-ink">Courts we appear in</h3>
            <ul className="mt-4 space-y-3 text-body text-ink-2">
              {courts.map((court) => (
                <li key={court.name}>
                  {court.name}
                  {court.address && (
                    <span className="block text-small text-ink-3">{court.address}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-sans text-h4 text-ink">Families we work with</h3>
            <p className="mt-4 text-body text-ink-2">
              {cityNames}, and the rest of Santa Clara County, {regionNames}, and the{' '}
              {regions[regions.length - 1]}. {sanMateo} go to San Mateo County Superior Court in
              Redwood City; a {alameda} trust dispute is usually filed in Alameda County; everything
              else on this list goes to San Jose.
            </p>
            <Link
              href="/service-areas/"
              className="mt-5 inline-block text-small font-medium text-maroon-700 underline-offset-3 hover:underline"
            >
              Where we practice <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
