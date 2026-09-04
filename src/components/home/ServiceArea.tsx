import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cities } from '@/config/service-areas';

const regions = ['the Peninsula', 'the East Bay'];

/** HOMEPAGE-SPEC §9: two columns, no map. */
export function ServiceArea() {
  return (
    <section className="py-16 lg:py-24">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <SectionHeading
            eyebrow="Service area"
            title="San Jose first. The whole Bay Area when the case calls for it."
          />
          <p className="mt-6 max-w-[62ch] text-body-lg text-ink-2">
            We show up in person when it counts. We handle trust and estate cases in Santa Clara
            County Superior Court in San Jose and across the Bay Area, in San Mateo, Alameda, and
            San Francisco counties.
          </p>
          <div className="mt-8">
            <Button variant="secondary" href="/service-areas/">
              Where we practice
            </Button>
          </div>
        </div>
        <div className="lg:col-span-5 lg:pt-8">
          <h3 className="eyebrow">Families we serve come from</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 text-body text-ink-2 lg:gap-y-2">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/service-areas/#${city.slug}`}
                  // Underlined at rest: on a phone nothing else tells a city link apart from the plain region names beside it.
                  className="tap-row underline decoration-line-strong underline-offset-3 hover:text-maroon-700 hover:decoration-current"
                >
                  {city.name}
                </Link>
              </li>
            ))}
            {regions.map((region) => (
              <li key={region}>{region}</li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
