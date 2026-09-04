import { ContactBand } from '@/components/home/ContactBand';
import { HowWeWorkSteps } from '@/components/home/HowWeWork';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { courts } from '@/config/service-areas';
import { site } from '@/config/site';
import { webPage } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'Contact Rothrock Legal – Request a Consult in San Jose';
const DESCRIPTION =
  'Request a consult with Rothrock Legal in San Jose. We read it, run a conflict check, and ' +
  'strive to respond within one business day.';
const PATH = '/contact/';

export const metadata = pageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
});

export default function ContactPage() {
  return (
    <>
      <div className="bg-white">
        <Container className="pt-8 lg:pt-10">
          <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
        </Container>
      </div>
      <ContactBand headingLevel="h1" id="consult" />
      <section className="grid-hairline bg-sand py-16 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="What to expect"
              title="Here's what happens when you reach out."
            />
            <div className="mt-8">
              <HowWeWorkSteps />
            </div>
          </div>
          <div className="lg:col-span-5">
            <h3 className="eyebrow">Where cases are heard</h3>
            <ul className="mt-4 space-y-3 text-body text-ink-2">
              {courts.map((court) => (
                <li key={court.name}>{court.name}</li>
              ))}
            </ul>
            <p className="mt-6 text-small text-ink-3">{site.office.appointments}</p>
          </div>
        </Container>
      </section>
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
