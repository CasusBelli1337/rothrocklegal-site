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
    body: 'A petition in the probate court where the case belongs. Mediation when it makes sense. Trial when it doesn’t.',
  },
];

export type StepsLayout = 'list' | 'grid';

/**
 * 'list' stacks the steps with the number beside the title (/contact/).
 * 'grid' runs them four across on the homepage with the number above the
 * title; on a phone, where the grid is one column anyway, it reads as the list.
 */
const layouts: Record<StepsLayout, { list: string; item: string; body: string }> = {
  list: { list: 'space-y-8', item: 'flex gap-5', body: 'mt-1.5 max-w-[56ch]' },
  grid: {
    list: 'grid gap-8 sm:grid-cols-2 lg:grid-cols-4',
    item: 'flex gap-5 sm:flex-col sm:gap-4',
    body: 'mt-1.5 sm:mt-2',
  },
};

/** The four steps, reusable on /contact/. */
export function HowWeWorkSteps({ layout = 'list' }: { layout?: StepsLayout }) {
  const c = layouts[layout];
  return (
    <ol className={c.list}>
      {steps.map((step, i) => (
        <li key={step.title} className={c.item}>
          <span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brass-400 font-serif text-lg text-brass-600 tabular"
          >
            {i + 1}
          </span>
          <div>
            <h3 className="font-sans text-h4 text-ink">{step.title}</h3>
            <p className={`${c.body} text-body text-ink-2`}>{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
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
        <Reveal className="mt-10">
          <HowWeWorkSteps layout="grid" />
        </Reveal>
      </Container>
    </section>
  );
}
