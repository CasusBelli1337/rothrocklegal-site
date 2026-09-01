import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/config/site";

const steps = [
  {
    title: "You tell us what happened.",
    body: `A call or the form. We listen, and we ask about dates – who died, when, and whether anyone sent you a notice. ${site.replyPromise.replace(/^\[/, "[We reply ").replace(/\]$/, ".]")}`,
  },
  {
    title: "We check the clock and the documents.",
    body: "The trust, the amendments, the notice letters, the medical records, the bank statements.",
  },
  {
    title: "You get a straight answer.",
    body: "Whether you have a case worth bringing, what it would take, and what it would cost. No pitch.",
  },
  {
    title: "We move.",
    body: "A petition in Santa Clara County Superior Court – Probate Division, or wherever the case belongs. Mediation when it makes sense. Trial when it doesn’t.",
  },
];

/** The four steps, reusable on /about/. */
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
            <p className="mt-1.5 max-w-[56ch] text-body text-ink-2">
              {step.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** The Legion credential, framed as speed for the client (HOMEPAGE-SPEC §5). */
export function WhyFasterPanel() {
  return (
    <div className="rounded-xl border border-line bg-white p-6 lg:p-8">
      <h3 className="font-serif text-h3 text-ink">Why our cases move faster</h3>
      <p className="mt-3 text-body text-ink-2">
        Arthur is the co-founder and CEO of Legion, an AI litigation platform.
        That&rsquo;s why we can go through thousands of pages of bank records
        and medical files in days instead of months, and why our drafting
        doesn&rsquo;t sit in a queue. Lawyers still make every judgment call.
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
          <Reveal className="lg:col-span-5">
            <WhyFasterPanel />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
