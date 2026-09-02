import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cities, courts, type City } from '@/config/service-areas';
import { site } from '@/config/site';
import { webPage } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'Where We Practice – San Jose, Santa Clara County & the Bay Area';
const DESCRIPTION =
  'Trust and estate litigation in San Jose and Santa Clara County, with regular appearances in ' +
  'San Mateo, Alameda, and San Francisco Superior Courts.';
const PATH = '/service-areas/';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const groups: { county: City['county']; title: string; intro: string }[] = [
  {
    county: 'Santa Clara County',
    title: 'Santa Clara County cases are heard in San Jose.',
    intro:
      'Every trust and estate dispute in the county, from Palo Alto to Morgan Hill, is filed in the ' +
      'Probate Division of Santa Clara County Superior Court at 191 N. First Street. That is our home ' +
      'court, and it is where most of our cases are, including the complex estates from Palo Alto, ' +
      'Los Altos, Los Altos Hills, Saratoga, and Los Gatos.',
  },
  {
    county: 'San Mateo County',
    title: 'Peninsula cases are heard in Redwood City.',
    intro:
      'Atherton, Menlo Park, Woodside, Portola Valley, Hillsborough, and Burlingame are in San Mateo ' +
      'County, so their trust and estate disputes go to San Mateo County Superior Court in Redwood ' +
      'City. Many of the complex estates we handle, with several properties, an LLC, or a family ' +
      'business held in trust, come from these communities.',
  },
  {
    county: 'Alameda County',
    title: 'Fremont and the East Bay go to Alameda County Superior Court.',
    intro:
      'Fremont, Newark, and Union City sit in Alameda County, so their probate cases are heard in ' +
      'Oakland. We appear there regularly and meet East Bay clients by video.',
  },
];

function CityEntry({ city }: { city: City }) {
  return (
    <section id={city.slug} className="scroll-mt-24 rounded-xl border border-line bg-white p-5">
      <h3 className="font-sans text-h4 text-ink">{city.name}</h3>
      <p className="mt-1 text-meta text-ink-3">{city.county}</p>
      <p className="mt-3 text-small text-ink-2">{city.note}</p>
    </section>
  );
}

export default function ServiceAreasPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-10 lg:py-16">
          <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Where we practice' }]} />
          <div className="mt-8 max-w-[52rem]">
            <Eyebrow rule>Service area</Eyebrow>
            <h1 className="mt-4 font-serif text-h1 text-ink">
              San Jose first. The whole Bay Area when the case calls for it.
            </h1>
            <p className="mt-6 text-lead text-ink-2">
              We meet by video anywhere in California and appear in person in court. Most of our
              cases are in Santa Clara County Superior Court &ndash; Probate Division, and we
              regularly appear in San Mateo, Alameda, and San Francisco Superior Courts.{' '}
              {site.office.appointments}
            </p>
          </div>
        </Container>
      </section>

      <section className="grid-hairline bg-sand py-16 lg:py-20" aria-labelledby="courts">
        <Container>
          <Reveal>
            <SectionHeading id="courts" eyebrow="Courts" title="The courts we appear in." />
          </Reveal>
          <Reveal stagger className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {courts.map((court) => (
              <div key={court.name} className="rounded-xl border border-line bg-white p-5">
                <h3 className="font-sans text-h4 text-ink">{court.name}</h3>
                <p className="mt-2 text-small text-ink-2">{court.address ?? court.city}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {groups.map((group) => (
        <section
          key={group.county}
          className="py-16 lg:py-20"
          aria-labelledby={`county-${group.county}`}
        >
          <Container>
            <Reveal>
              <SectionHeading
                id={`county-${group.county}`}
                eyebrow={group.county}
                title={group.title}
                lead={group.intro}
              />
            </Reveal>
            <Reveal stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cities
                .filter((city) => city.county === group.county)
                .map((city) => (
                  <CityEntry key={city.slug} city={city} />
                ))}
            </Reveal>
          </Container>
        </section>
      ))}

      <section className="bg-white py-16 lg:py-20" aria-labelledby="san-francisco">
        <Container className="max-w-[52rem]">
          <SectionHeading
            id="san-francisco"
            eyebrow="San Francisco and the rest of the Peninsula"
            title="San Francisco cases are filed in San Francisco Superior Court."
            lead="Families in San Francisco, and in Peninsula cities not listed above such as Redwood City and San Mateo, bring trust and estate disputes to the San Francisco and San Mateo County Superior Courts. We appear in both, and the first conversation works the same way wherever you are: by video, about dates first."
          />
        </Container>
      </section>

      <CtaBand />
      <JsonLd
        data={webPage({
          path: PATH,
          title: TITLE,
          description: DESCRIPTION,
          updated: site.lastUpdated,
        })}
      />
    </>
  );
}
