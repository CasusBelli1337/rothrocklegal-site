import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const split: readonly { title: string; body: string }[] = [
  {
    title: 'What the software does',
    body: 'Reads every page of the bank records and medical files. Builds the timeline. Writes the first draft of pleadings, discovery, and motions.',
  },
  {
    title: 'What the lawyers do',
    body: 'Decide what to file and what to argue. Take the depositions. Read every draft, line by line, before it goes out. Stand up in court.',
  },
  {
    title: 'What it means for your bill',
    body: 'Weeks saved at the start of a case, when the deadlines are shortest. Fewer hours billed for reading and typing. Associate rates for the document work. More of the budget on the work that moves the case.',
  },
];

/** The Legion credential, expanded (HOMEPAGE-SPEC §5): AI reads and drafts, lawyers decide. */
export function HowWeWork() {
  return (
    <section className="grid-hairline bg-sand py-16 lg:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How we work"
            title="The software does the reading. The lawyers make every call."
          />
          <div className="mt-6 max-w-[64ch] space-y-4 text-body-lg text-ink-2">
            <p>
              Here&rsquo;s the thing about litigation bills: most of the money goes to reading and
              drafting. Thousands of pages of bank statements and medical records, then the same
              fifty-page pleadings, discovery, and motions rebuilt by hand. That is where a trust
              case gets expensive.
            </p>
            <p>
              Arthur is the co-founder and CEO of Legion, an AI litigation platform built for
              California litigators, and this firm runs its cases on it. The records get read in
              days instead of months, and a first draft doesn&rsquo;t wait in a queue. Every
              judgment call &ndash; what to file, what to argue, when to settle, when to try the
              case &ndash; is a lawyer&rsquo;s, and a lawyer reads every document before it leaves
              the office.
            </p>
            <p>
              Other firms sell what they call &ldquo;traditional&rdquo; legal services. We think
              traditional means slower and more expensive than it has to be. Here the associates
              handle the document work at lower rates, the same AI platform Legion builds for
              litigators does the reading and the first drafts, and a lawyer makes every judgment
              call. Fewer hours on your bill, and the hours you do pay for go to strategy, evidence,
              and the courtroom.
            </p>
            <p>
              We meet by video, and in person by appointment when the case calls for it. No office
              visits, no parking, no waiting rooms.
            </p>
          </div>
        </Reveal>
        <Reveal stagger className="mt-10 grid gap-4 md:grid-cols-3">
          {split.map((item) => (
            <div key={item.title} className="rounded-xl border border-line bg-white p-6">
              <h3 className="font-sans text-h4 text-ink">{item.title}</h3>
              <p className="mt-2 text-body text-ink-2">{item.body}</p>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
