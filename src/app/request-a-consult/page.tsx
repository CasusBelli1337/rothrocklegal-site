import { IntakeFlow } from '@/components/intake/IntakeFlow';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/config/site';
import { AFTER_YOU_SEND } from '@/lib/intake/copy';
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

function AfterYouSend() {
  return (
    <section aria-labelledby="after-you-send" className="bg-white py-16 lg:py-20">
      <Container className="max-w-[52rem]">
        <Reveal>
          <Eyebrow rule>What to expect</Eyebrow>
          <h2 id="after-you-send" className="mt-3 font-serif text-h2 text-ink">
            What happens after you send this
          </h2>
        </Reveal>
        <ol className="mt-8 space-y-6">
          {AFTER_YOU_SEND.map((step, i) => (
            <li key={step.title} className="flex gap-5">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brass-400 font-serif text-lg text-brass-600 tabular"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-sans text-h4 text-ink">{step.title}</h3>
                <p className="mt-1.5 max-w-[56ch] text-body text-ink-2">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <section aria-labelledby="intake-disclaimer" className="mt-12 border-t border-line pt-6">
          <h3 id="intake-disclaimer" className="text-small font-semibold text-ink">
            Disclaimer
          </h3>
          <p className="mt-2 text-small text-ink-3">
            This page is general information, not legal advice. Sending it does not make you a
            client of Rothrock Legal, and no attorney&ndash;client relationship exists until both
            sides sign an engagement letter. Deadlines depend on facts we have not seen, and the law
            changes; confirm every date with a lawyer. Do not send us documents that belong to
            another lawyer&rsquo;s client file or that you were told you may not share.
          </p>
        </section>
      </Container>
    </section>
  );
}

export default function RequestConsultPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-10 lg:py-16">
          <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Request a Consult' }]} />
          <div className="mt-8 max-w-[52rem]">
            <Eyebrow rule>Request a consult</Eyebrow>
            <h1 className="mt-4 font-serif text-h1 text-ink">
              Tell us what happened. We&rsquo;ll tell you what we need.
            </h1>
            <p className="mt-6 max-w-[60ch] text-lead text-ink-2">
              We meet by video, and in person by appointment when it helps. No office visits, no
              parking, no waiting rooms. Fill this out when you have a few quiet minutes. It saves
              as you go, and a lawyer reads everything before we reply.
            </p>
          </div>
        </Container>
      </section>
      <section className="grid-hairline bg-sand py-12 lg:py-16" aria-label="Request a consult form">
        <Container className="max-w-[52rem]">
          <IntakeFlow />
        </Container>
      </section>
      <AfterYouSend />
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
