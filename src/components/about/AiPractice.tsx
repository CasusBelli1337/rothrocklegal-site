import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { asset } from '@/config/site';

/** Legion's mark: the brand `Logo.svg`, copied unchanged; width and height are its viewBox. */
const legionLogo = { src: '/images/partners/legion-logo.svg', width: 613, height: 328 };

const points: readonly { lead: string; body: string }[] = [
  {
    lead: 'Days, not months.',
    body: 'The records are organized and searchable in days. That saves weeks at the start of a case, when the deadlines are shortest.',
  },
  {
    lead: 'First drafts in hours.',
    body: 'Pleadings, discovery, and motions come back as first drafts in hours. The lawyers’ time goes into the argument, not the typing.',
  },
  {
    lead: 'A lawyer makes every call.',
    body: 'The software organizes and drafts. It decides nothing. The lawyer who signs a filing is the one who answers for it in court.',
  },
  {
    lead: 'A smaller bill for the heavy lifting.',
    body: 'Fewer hours billed for organizing and drafting. More of your budget on the work that moves the case.',
  },
];

/**
 * The Legion section (Arthur, 2026-09-03: "AI is in our DNA"). What the platform
 * means for a family's case, the guardrail, then four points. Legion is described
 * as what the firm uses; the site never sells it.
 */
export function AiPractice() {
  return (
    <section className="grid-hairline bg-sand py-16 lg:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="An AI-enabled practice" title="AI is in this firm's DNA." />
            <div className="mt-6 max-w-[64ch] space-y-4 text-body-lg text-ink-2">
              <p>
                Arthur is the co-founder and CEO of Legion, an AI litigation platform built for
                California litigators, and this firm runs its cases on it. For your case, that means
                the bank records, medical files, and trust documents are organized and searchable in
                days, not months. First drafts of pleadings and discovery come back in hours, not
                days. The lawyers&rsquo; time goes where it counts: strategy, evidence, and the
                courtroom. And the heavy lifting costs less.
              </p>
              <p>
                None of that replaces judgment. What to file, what to argue, when to settle, when to
                try the case &ndash; every one of those calls is a lawyer&rsquo;s. A lawyer reads
                every filing before it goes out, and a lawyer stands behind it in court.
              </p>
            </div>
          </div>
          <figure className="relative self-start border border-line bg-white p-6 md:p-8 lg:col-span-5 lg:col-start-8">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brass-400" />
            <Image
              src={asset(legionLogo.src)}
              alt="Legion"
              width={legionLogo.width}
              height={legionLogo.height}
              className="h-12 w-auto md:h-14"
            />
            <figcaption className="mt-5 text-body text-ink-2">
              Legion, the AI litigation platform Arthur co-founded.
            </figcaption>
          </figure>
        </div>
        <ul className="mt-10 grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-4">
          {points.map((point) => (
            <li key={point.lead} className="border-r border-b border-line bg-white p-5 md:p-6">
              <p className="font-sans text-h4 text-ink">{point.lead}</p>
              <p className="mt-2 text-body text-ink-2">{point.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
