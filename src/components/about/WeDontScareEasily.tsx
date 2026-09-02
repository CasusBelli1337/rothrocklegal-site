import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { site } from '@/config/site';

/** Anchor for the homepage pointer (WhyFasterPanel). */
export const CASE_BLOCK_ID = 'we-dont-scare-easily';

/** Public-record dates only (ARTHUR-DOSSIER.md §14, Law360 / Hankook Ilbo). */
const record: readonly { when: string; what: string }[] = [
  {
    when: 'June 2026',
    what: 'A federal directive cuts off the AI models Legion runs on.',
  },
  {
    when: 'June 2026',
    what:
      'Legion, with outside trial counsel, sues the United States in the U.S. District Court for ' +
      "the District of Columbia. Arthur's team does the first drafts on Legion's platform.",
  },
  {
    when: 'June 30, 2026',
    what: 'The government withdraws the directive. Legion dismisses the case.',
  },
];

/**
 * Legion v. United States, told from the public record and nothing else: no
 * strategy, no forum talk, no research-platform names, no "won". Legion was
 * represented by outside trial counsel; Arthur's team drafted on Legion's
 * platform. Never say or imply that Rothrock Legal litigated it. Arthur's
 * call (2026-09-01); the dossier's §14 recommendation was to omit it.
 */
export function WeDontScareEasily() {
  return (
    <section id={CASE_BLOCK_ID} className="band-maroon scroll-mt-[6.5rem] py-16 lg:py-20">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <SectionHeading
            tone="light"
            eyebrow="We don't scare easily"
            title="In 2026 the federal government ordered our tools shut down. Legion went to court."
          />
          <div className="mt-6 max-w-[62ch] space-y-4 text-body-lg text-white/85">
            <p>
              In June 2026 the federal government ordered the AI models Arthur&rsquo;s company runs
              on shut down. Legion took the United States to court in Washington, D.C., with outside
              trial counsel, and Arthur&rsquo;s team did the first drafts on Legion&rsquo;s own
              platform. On June 30, 2026, the government withdrew the order, and Legion dismissed
              the case.
            </p>
            <p>
              The point for you: the person setting strategy on your case does not scare easily, and
              the tools we use have been tested against the hardest opponent there is. One litigator
              with these tools can take a case the distance. The goal is a trial on the merits, not
              a war of attrition.
            </p>
            <p>
              If Arthur&rsquo;s company will take the United States to court over a tool it believes
              in, a trustee who will not produce an accounting does not worry us.
            </p>
          </div>
          <p className="mt-6 text-small text-white/65">{site.resultsDisclaimer}</p>
        </Reveal>
        <Reveal className="lg:col-span-5 lg:pt-2">
          <div className="rounded-xl border border-white/20 bg-white/5 p-6 lg:p-8">
            <Eyebrow tone="light" rule>
              On the record
            </Eyebrow>
            <dl className="mt-5 space-y-5">
              {record.map((item, i) => (
                <div key={i} className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
                  <dt className="font-serif text-body text-white/70 tabular">{item.when}</dt>
                  <dd className="text-body text-white/90">{item.what}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
