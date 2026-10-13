import { AddFlow } from '@/components/intake/add/AddFlow';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { site } from '@/config/site';
import { ADDITION_PAGE_PATH } from '@/lib/intake/contract';
import { webPage } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'Add to Your Consult Request | Rothrock Legal';
const DESCRIPTION =
  'Already sent Rothrock Legal a consult request? Add documents or a note to it here. ' +
  'We email you a link to the request you sent.';

export const metadata = pageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: ADDITION_PAGE_PATH,
  noindex: false,
});

/**
 * "Add to your request" (Arthur, 2026-10-13): a person who already sent a
 * request adds documents or a note to it. Breadcrumbs, the panel (its small
 * serif heading is the page's h1), and one disclaimer line, like the consult
 * page. Out of the nav; reached from the consult page, its done screen, and
 * the two emails.
 */
export default function AddToRequestPage() {
  return (
    <>
      <section className="grid-hairline bg-sand" aria-label="Add to your request form">
        <Container className="max-w-[52rem] pt-4 pb-8 lg:pt-5 lg:pb-10">
          <Breadcrumbs
            trail={[
              { label: 'Home', href: '/' },
              { label: 'Request a Consult', href: '/request-a-consult/' },
              { label: 'Add to your request' },
            ]}
          />
          <div className="mt-4">
            <AddFlow
              heading={
                <h1 className="font-serif text-meta tracking-[0.12em] text-brass-600 uppercase">
                  Add to your request
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
          path: ADDITION_PAGE_PATH,
          title: TITLE,
          description: DESCRIPTION,
          updated: site.lastUpdated,
        })}
      />
    </>
  );
}
