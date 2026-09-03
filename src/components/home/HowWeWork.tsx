import Link from 'next/link';
import { CASE_BLOCK_ID } from '@/components/about/WeDontScareEasily';
import { ArrowRightIcon } from '@/components/icons';
import { Slot } from '@/components/lens/Slot';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { lensCopy } from '@/config/lens-copy';

/** Step 1 is a lens slot: a trustee is asked what was demanded of them, not what happened to them. */
const steps: { title: string; body: React.ReactNode }[] = [
  {
    title: 'You request a consult online.',
    body: <Slot name="how-step-1" variants={lensCopy.howStep1} />,
  },
  {
    title: 'We check the clock and the documents.',
    body: 'The trust, the amendments, the notice letters, the medical records, the bank statements.',
  },
  {
    title: 'You get a straight answer.',
    body: 'Whether you have a case worth bringing, what it would take, and what it would cost. No pitch.',
  },
  {
    title: 'We move.',
    body: 'A petition in Santa Clara County Superior Court – Probate Division, or wherever the case belongs. Mediation when it makes sense. Trial when it doesn’t.',
  },
];

/** The four steps, reusable on /contact/. */
export function HowWeWorkSteps() {
  return (
    <ol className="space-y-8">
      {steps.map((step, i) => (
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
  );
}

/** The Legion credential, framed as speed and a smaller bill (HOMEPAGE-SPEC §5), with the one-line case pointer. */
export function WhyFasterPanel() {
  return (
    <div className="rounded-xl border border-line bg-white p-6 lg:p-8">
      <h3 className="font-serif text-h3 text-ink">Why our cases move faster</h3>
      <p className="mt-3 text-body text-ink-2">
        <Slot name="why-faster-lead" variants={lensCopy.whyFasterLead} /> The software reads
        thousands of pages of bank records and medical files in days instead of months and writes
        the first drafts, so fewer hours land on your bill and the work moves faster. Lawyers still
        make every judgment call.
      </p>
      <p className="mt-3 text-body text-ink-2">
        We meet by video, and in person by appointment when the case calls for it. No office visits,
        no parking, no waiting rooms.
      </p>
      <p className="mt-3 text-body text-ink-2">
        In June 2026 the federal government ordered the models Legion runs on shut down; Legion took
        the United States to court in Washington, D.C. with outside trial counsel, Arthur&rsquo;s
        team did the first drafts on Legion&rsquo;s own platform, and the government withdrew the
        order on June 30, 2026.
      </p>
      <Link
        href={`/about/#${CASE_BLOCK_ID}`}
        className="tap-link mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-maroon-700 hover:text-maroon-600"
      >
        Why that matters to your case
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}

/** Who does what on a case (Arthur, 2026-09-01): senior judgment where it matters, associate rates for the heavy lifting. */
export function WhoDoesWhatPanel() {
  return (
    <div className="rounded-xl border border-line bg-white p-6 lg:p-8">
      <h3 className="font-serif text-h3 text-ink">Who does what on your case</h3>
      <p className="mt-3 text-body text-ink-2">
        Arthur sets the strategy and the big picture on every case. Jonathan, a former Marine Corps
        infantry captain who practiced at Wilson Sonsini and Fenwick &amp; West, takes the
        depositions and argues the hearings. Gerry and Max, the associates, execute the plan: the
        records, the discovery, the drafting, at lower rates. You get senior judgment where it
        matters, a courtroom presence judges know, and a smaller bill for the heavy lifting.
      </p>
    </div>
  );
}

export function HowWeWork() {
  return (
    <section className="grid-hairline bg-sand py-16 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="What to expect"
            title="Here's what happens when you reach out."
          />
        </Reveal>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-7">
            <HowWeWorkSteps />
          </Reveal>
          <Reveal className="space-y-5 lg:col-span-5">
            <WhoDoesWhatPanel />
            <WhyFasterPanel />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
