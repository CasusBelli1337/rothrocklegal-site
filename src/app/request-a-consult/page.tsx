import { IntakeFlow } from '@/components/intake/IntakeFlow';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { site } from '@/config/site';
import { webPage } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'Request a Consult – Trust & Estate Litigation, San Jose | Rothrock Legal';
const DESCRIPTION =
  'Tell us what happened and upload what you have. We tell you what we need. Trust and estate ' +
  'disputes in San Jose. We reply within one business day.';
const PATH = '/request-a-consult/';

export const metadata = pageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  noindex: false,
});

/**
 * The consult request: breadcrumbs, the flow panel (its small serif heading is
 * the page's h1), and one disclaimer line. Nothing else, so every screen fits
 * a laptop viewport and the action bar never moves (Arthur, 2026-09-03).
 */
export default function RequestConsultPage() {
  return (
    <>
      <section className="grid-hairline bg-sand" aria-label="Request a consult form">
        <Container className="max-w-[52rem] pt-4 pb-8 lg:pt-5 lg:pb-10">
          <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Request a Consult' }]} />
          <div className="mt-4">
            <IntakeFlow
              heading={
                <h1 className="font-serif text-meta tracking-[0.12em] text-brass-600 uppercase">
                  Request a consult
                </h1>
              }
            />
          </div>
          <p className="mt-4 text-small text-ink-3">
            Sending this does not make you a client of Rothrock Legal. No attorney&ndash;client
            relationship exists until both sides sign an engagement letter.
          </p>
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
