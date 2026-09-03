import { Slot } from '@/components/lens/Slot';
import { Container } from '@/components/ui/Container';
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
    body: 'We file in court and keep the case moving. Mediation when it makes sense. Trial when it doesn’t.',
  },
];

export type StepsLayout = 'list' | 'grid';

/**
 * 'list' stacks the steps (/contact/); 'grid' runs them four across on the
 * homepage. In both, the square brass number sits to the left of the title on
 * one row (Arthur, 2026-09-03) and the body hangs under the title.
 */
const layouts: Record<StepsLayout, { list: string; body: string }> = {
  list: { list: 'space-y-8', body: 'max-w-[56ch]' },
  grid: { list: 'grid gap-8 sm:grid-cols-2 lg:grid-cols-4', body: '' },
};

/** The four steps, reusable on /contact/. */
export function HowWeWorkSteps({ layout = 'list' }: { layout?: StepsLayout }) {
  const c = layouts[layout];
  return (
    <ol className={c.list}>
      {steps.map((step, i) => (
        <li key={step.title} className="grid grid-cols-[2.5rem_1fr] items-start gap-x-4">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center border border-brass-400 font-serif text-lg text-brass-600 tabular"
          >
            {i + 1}
          </span>
          <h3 className="flex min-h-10 items-center font-sans text-h4 text-ink">{step.title}</h3>
          <p className={`${c.body} col-start-2 mt-2 text-body text-ink-2`}>{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function HowWeWork() {
  return (
    <section className="grid-hairline bg-sand py-16 lg:py-24">
      <Container>
        <SectionHeading eyebrow="What to expect" title="Here's what happens when you reach out." />
        <div className="mt-10">
          <HowWeWorkSteps layout="grid" />
        </div>
      </Container>
    </section>
  );
}
