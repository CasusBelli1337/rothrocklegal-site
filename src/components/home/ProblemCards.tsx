import Link from "next/link";
import {
  ArrowRightIcon,
  BoxIcon,
  BriefcaseIcon,
  CoinsIcon,
  FileXIcon,
  HomeIcon,
  LedgerIcon,
  PenIcon,
  PulseIcon,
  UsersIcon,
} from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getPracticeArea,
  practiceHref,
  type PracticeArea,
  type PracticeIcon,
} from "@/config/practice-areas";

const icons: Record<
  PracticeIcon,
  (p: { className?: string }) => React.ReactNode
> = {
  pen: PenIcon,
  ledger: LedgerIcon,
  pulse: PulseIcon,
  home: HomeIcon,
  coins: CoinsIcon,
  "file-x": FileXIcon,
  box: BoxIcon,
  users: UsersIcon,
  briefcase: BriefcaseIcon,
};

/** Card order is fixed by HOMEPAGE-SPEC §3. */
const ORDER = [
  "trust-contests",
  "trust-accounting-disputes",
  "undue-influence-and-capacity",
  "financial-elder-abuse",
  "breach-of-fiduciary-duty",
  "will-contests",
  "estate-property-disputes",
  "trust-litigation",
];

export function ProblemCard({ area }: { area: PracticeArea }) {
  const card = area.card;
  if (!card)
    throw new Error(`Practice area "${area.slug}" has no homepage card`);
  const Icon = icons[card.icon];
  return (
    <Card
      href={card.href ?? practiceHref(area)}
      className="flex h-full flex-col"
    >
      <Icon className="h-6 w-6 text-brass-500" />
      <h3 className="mt-4 font-sans text-h4 text-ink">
        &ldquo;{card.headline}&rdquo;
      </h3>
      <p className="mt-2 flex-1 text-small text-ink-3">{card.answer}</p>
      <p className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-maroon-700">
        What you can do
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </p>
    </Card>
  );
}

export function ProblemCards() {
  const areas = ORDER.map(getPracticeArea);
  if (areas.length !== 8) throw new Error("Homepage expects 8 problem cards");
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Where to start"
            title="What's going on in your family?"
            lead="Pick the sentence that sounds like yours. Each page explains what the law says, what you can do, and how fast you need to move."
          />
        </Reveal>
        <Reveal
          stagger
          className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {areas.map((area) => (
            <ProblemCard key={area.slug} area={area} />
          ))}
        </Reveal>
        <p className="mt-8 text-small text-ink-3">
          Business or partnership dispute instead?{" "}
          <Link
            href="/business-disputes/"
            className="font-medium text-maroon-700 underline underline-offset-3"
          >
            We handle those too.
          </Link>
        </p>
      </Container>
    </section>
  );
}
