import type { Metadata } from 'next';
import { PageTitleBand } from '@/components/PageTitleBand';
import { DeadlineWizard } from '@/components/wizard/DeadlineWizard';
import { site } from '@/config/site';

const TITLE = 'How Long Do I Have to Contest a Will or Trust in California?';
const DESCRIPTION =
  'Usually 120 days after a trustee’s notice or a will is admitted to probate, and one year ' +
  'from death for most other claims. Answer a few questions to see your estimated deadlines.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/how-long-do-i-have/' },
  openGraph: {
    title: `${TITLE} | ${site.name}`,
    description: DESCRIPTION,
    url: '/how-long-do-i-have/',
  },
};

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
    <p className="text-lg leading-relaxed text-navy">
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
    <section aria-labelledby="how-it-works" className="mt-16">
      <p className="eyebrow">The rules</p>
      <h2 id="how-it-works" className="font-serif-accent mt-2 text-3xl font-semibold text-black">
        How the deadlines work
      </h2>
      <div className="mt-6 space-y-6">
        {HOW_IT_WORKS.map((item) => (
          <div key={item.heading}>
            <h3 className="text-lg font-bold text-black">{item.heading}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-navy">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Disclaimer() {
  return (
    <section aria-labelledby="wizard-disclaimer" className="mt-12 border-t border-gray-200 pt-6">
      <h2 id="wizard-disclaimer" className="text-sm font-bold text-black">
        Disclaimer
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-navy-light">
        This page is general information, not legal advice, and using it does not make you a client
        of Rothrock Legal. No attorney&ndash;client relationship exists until you sign an engagement
        letter with us. The dates it shows are estimates based only on what you entered. Deadlines
        depend on facts we have not seen, and the law changes. Confirm every date with a lawyer
        before you rely on it.
      </p>
    </section>
  );
}

export default function HowLongDoIHavePage() {
  return (
    <>
      <PageTitleBand title="How Long Do I Have to Contest a Will or Trust?" />
      <div className="mx-auto max-w-4xl px-6 py-14">
        <Intro />
        <div className="mt-10">
          <DeadlineWizard />
        </div>
        <HowItWorks />
        <Disclaimer />
      </div>
    </>
  );
}
