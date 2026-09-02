import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** Who does what (Arthur, 2026-09-01). No promises, just the division of labor. */
const roles: readonly { who: string; what: string }[] = [
  {
    who: 'Arthur',
    what: 'Sets the strategy and the big picture on every case. Decides what gets filed, what gets argued, and when to try it.',
  },
  {
    who: 'Jonathan',
    what: 'Takes the depositions and argues the hearings.',
  },
  {
    who: 'Gerry and Max',
    what: 'The associates. They execute the plan: the records, the discovery, the drafting, at lower rates.',
  },
  {
    who: "The firm's AI tools",
    what: 'Do the reading and the first drafts. A lawyer reviews every page before it leaves the office.',
  },
];

/** "How we work as a team" for /attorneys/ (sand band). */
export function TeamHowWeWork() {
  return (
    <section className="grid-hairline bg-sand py-16 lg:py-20">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-6">
          <SectionHeading
            eyebrow="How we work as a team"
            title="Senior judgment where it matters. Associate rates for the heavy lifting."
          />
          <div className="mt-6 space-y-4 text-body-lg text-ink-2">
            <p>
              That split is on purpose. A trust contest can turn on one line in a bank statement or
              one entry in a medical chart, and finding it means reading everything. Software reads
              faster than people. People decide what it means. And the decisions that shape the case
              come from the lawyers who have to stand behind them in court.
            </p>
            <p>
              The people you meet in the first conversation are the people who work the case. Nobody
              hands you off.
            </p>
          </div>
        </Reveal>
        <Reveal stagger className="grid gap-4 self-center lg:col-span-6">
          {roles.map((role) => (
            <div key={role.who} className="rounded-xl border border-line bg-white p-6">
              <h3 className="font-sans text-h4 text-ink">{role.who}</h3>
              <p className="mt-2 text-body text-ink-2">{role.what}</p>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
