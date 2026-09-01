import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const roles: readonly { who: string; what: string }[] = [
  {
    who: 'Arthur',
    what: 'Sets the strategy on every case. Takes the depositions, argues the hearings, tries the case.',
  },
  {
    who: 'The team',
    what: 'Runs discovery, goes through the records, and drafts the pleadings and motions.',
  },
  {
    who: "The firm's AI tools",
    what: 'Do the reading and the first drafts. A lawyer reviews every page before it leaves the office.',
  },
];

/** "How we work as a team" for /attorneys/ (sand band). No promises, just who does what. */
export function TeamHowWeWork() {
  return (
    <section className="grid-hairline bg-sand py-16 lg:py-20">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-6">
          <SectionHeading
            eyebrow="How we work as a team"
            title="One trial lawyer sets the strategy. The whole office does the digging."
          />
          <div className="mt-6 space-y-4 text-body-lg text-ink-2">
            <p>
              Arthur tries the cases and decides how each one gets run. The rest of the team runs
              discovery, reads the records, and drafts, using the firm&rsquo;s AI tools with Arthur
              reviewing the work before it goes out.
            </p>
            <p>
              That split is on purpose. A trust contest can turn on one line in a bank statement or
              one entry in a medical chart, and finding it means reading everything. Software reads
              faster than people. People decide what it means.
            </p>
            <p>
              The people you meet on the first call are the people who work the case. Nobody hands
              you off.
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
