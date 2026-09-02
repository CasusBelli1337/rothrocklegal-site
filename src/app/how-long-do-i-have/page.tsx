import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { DeadlineWizard } from '@/components/wizard/DeadlineWizard';
import { site } from '@/config/site';
import { webPage } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'How Long Do I Have to Contest a Will or Trust in California?';
const DESCRIPTION =
  'Answer four questions to see which California deadlines may apply. Trust contests can be ' +
  'barred 120 days after notice.';
const PATH = '/how-long-do-i-have/';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const HOW_IT_WORKS: readonly { heading: string; body: string }[] = [
  {
    heading: 'Trusts: the clock starts when the trustee mails you a notice',
    body:
      'When someone dies with a trust, the trustee must mail each heir and beneficiary a letter ' +
      'called a Notification by Trustee. From the day it is mailed, you have 120 days to file a ' +
      'trust contest. If you ask for a copy of the trust and it is delivered inside those 120 ' +
      'days, you get 60 days from delivery if that is later (Probate Code § 16061.8). No notice ' +
      'means that clock has not started, but a court can still turn away a claim you sat on ' +
      'for too long.',
  },
  {
    heading: 'Wills: the clock starts when a judge admits the will',
    body:
      'A will has no deadline until someone files it with the probate court. You can object ' +
      'before the judge admits it (Probate Code § 8250). Once the judge signs the order ' +
      'admitting the will, you have 120 days to ask the court to revoke it (Probate Code § 8270). ' +
      'Miss that, and the will stands.',
  },
  {
    heading: 'Most other claims: one year from the date of death',
    body:
      'A promise to leave you something, money the person owed you, or almost any other claim ' +
      'you could have brought against them while they were alive must be filed within one year ' +
      'of death (Code of Civil Procedure §§ 366.2 and 366.3). Financial elder abuse claims run ' +
      'four years from when you discovered the abuse (Welfare & Institutions Code § 15657.7), ' +
      'and claims against a trustee run three years from an accounting or from discovery ' +
      '(Probate Code § 16460).',
  },
  {
    heading: 'How the days are counted',
    body:
      'These are calendar days, counted from the day after the trigger. When the last day lands ' +
      'on a weekend or a court holiday, California law moves it to the next court day (Code of ' +
      'Civil Procedure § 12a). Exceptions exist in both directions: a defective notice can mean ' +
      'the clock never started, and a court can shorten your time if you wait. Treat every date ' +
      'here as the latest possible day, not a target.',
  },
];

function Intro() {
  return (
    <p className="mt-6 max-w-[60ch] text-lead text-ink-2">
      The short answer: in California you usually have <strong>120 days</strong> from the day a
      trustee mails you a formal notice to contest a trust (or <strong>60 days</strong> from getting
      a copy of the trust, if that is later), <strong>120 days</strong> after a judge admits a will
      to probate to contest the will, and <strong>one year</strong> from the date of death for most
      other claims. Some of those clocks may already be running. Answer a few questions below and
      this page shows every deadline that may apply, then puts you in touch with our trust and
      estate litigation lawyers in San Jose, serving Santa Clara County and the Bay Area.
    </p>
  );
}

function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="py-16 lg:py-20">
      <Container className="max-w-[52rem]">
        <Eyebrow rule>The rules</Eyebrow>
        <h2 id="how-it-works" className="mt-3 font-serif text-h2 text-ink">
          How the deadlines work
        </h2>
        <div className="mt-8 space-y-8">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.heading}>
              <h3 className="font-sans text-h4 text-ink">{item.heading}</h3>
              <p className="mt-2 text-body-lg text-ink-2">{item.body}</p>
            </div>
          ))}
        </div>
        <section aria-labelledby="wizard-disclaimer" className="mt-12 border-t border-line pt-6">
          <h3 id="wizard-disclaimer" className="text-small font-semibold text-ink">
            Disclaimer
          </h3>
          <p className="mt-2 text-small text-ink-3">
            This page is general information, not legal advice, and using it does not make you a
            client of Rothrock Legal. No attorney&ndash;client relationship exists until you sign an
            engagement letter with us. The dates it shows are estimates based only on what you
            entered. Deadlines depend on facts we have not seen, and the law changes. Confirm every
            date with a lawyer before you rely on it.
          </p>
        </section>
      </Container>
    </section>
  );
}

export default function HowLongDoIHavePage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-10 lg:py-16">
          <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'How Long Do I Have?' }]} />
          <div className="mt-8 max-w-[52rem]">
            <Eyebrow rule>Deadlines</Eyebrow>
            <h1 className="mt-4 font-serif text-h1 text-ink">
              How long do I have to contest a will or trust?
            </h1>
            <Intro />
          </div>
        </Container>
      </section>
      <section className="grid-hairline bg-sand py-12 lg:py-16" aria-label="Deadline wizard">
        <Container className="max-w-[52rem]">
          <DeadlineWizard />
        </Container>
      </section>
      <HowItWorks />
      <CtaBand
        title="Not sure which clock is yours?"
        lead={
          <>
            Put your dates in a consult request and we&rsquo;ll work it out with you in one
            conversation.
          </>
        }
      />
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
