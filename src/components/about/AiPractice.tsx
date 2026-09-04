import Image from 'next/image';
import { Commitments } from '@/components/legion/Commitments';
import { LegionLitigatorSeal } from '@/components/legion/LegionLitigatorSeal';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { legionLitigator } from '@/config/legion-litigator';
import { asset } from '@/config/site';

/** Legion's mark: the brand `Logo.svg`, copied unchanged; width and height are its viewBox. */
const legionLogo = { src: '/images/partners/legion-logo.svg', width: 613, height: 328 };

export const AI_PRACTICE_ID = 'ai-enabled-practice';

function Designation() {
  const { title, meaning, ask } = legionLitigator.about;
  return (
    <div className="mt-14 grid gap-10 border-t border-line pt-14 lg:grid-cols-12 lg:gap-16">
      <div className="flex justify-center lg:col-span-4 lg:justify-start">
        <LegionLitigatorSeal className="w-64 max-w-full lg:w-80" />
      </div>
      <div className="lg:col-span-8">
        <h3 className="font-serif text-h3 text-ink">{title}</h3>
        <div className="mt-4 max-w-[64ch] space-y-4 text-body-lg text-ink-2">
          <p>{meaning}</p>
          <p>{ask}</p>
        </div>
        <div className="mt-8">
          <Commitments />
        </div>
      </div>
    </div>
  );
}

/**
 * The Legion section (Arthur, 2026-09-03: "AI is in our DNA"; 2026-09-04: the
 * mark stands big beside the words, no box and no caption, and the Legion AI
 * Litigator seal follows). Legion is described as what the firm uses; the
 * site never sells it.
 */
export function AiPractice() {
  return (
    <section id={AI_PRACTICE_ID} className="grid-hairline scroll-mt-24 bg-sand py-16 lg:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
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
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <Image
              src={asset(legionLogo.src)}
              alt="Legion"
              width={legionLogo.width}
              height={legionLogo.height}
              className="h-auto w-full max-w-[22rem] lg:max-w-[26rem]"
            />
          </div>
        </div>
        <Designation />
      </Container>
    </section>
  );
}
