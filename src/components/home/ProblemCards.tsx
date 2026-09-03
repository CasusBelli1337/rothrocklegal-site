import type { CSSProperties } from 'react';
import { oddLastSpan } from '@/lib/grid';
import { LENS_ORDERED_CLASS, lensOrderStyle } from '@/lib/lens/order';
import { bindSectionSigns } from '@/lib/typography';
import {
  ArrowRightIcon,
  BoxIcon,
  BriefcaseIcon,
  CoinsIcon,
  FileXIcon,
  HomeIcon,
  LayersIcon,
  LedgerIcon,
  PenIcon,
  PulseIcon,
  ShieldIcon,
  UsersIcon,
} from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { lensConfig } from '@/config/lens';
import {
  getPracticeArea,
  practiceHref,
  type PracticeArea,
  type PracticeIcon,
} from '@/config/practice-areas';

const icons: Record<PracticeIcon, (p: { className?: string }) => React.ReactNode> = {
  pen: PenIcon,
  ledger: LedgerIcon,
  pulse: PulseIcon,
  home: HomeIcon,
  coins: CoinsIcon,
  'file-x': FileXIcon,
  box: BoxIcon,
  users: UsersIcon,
  briefcase: BriefcaseIcon,
  shield: ShieldIcon,
  layers: LayersIcon,
};

/**
 * Card order is fixed by HOMEPAGE-SPEC §3; the trustee card (the other side of
 * the table) comes last in the HTML. Under the trustee lens CSS `order` moves
 * it first (lensConfig.cardsFirst) without re-rendering.
 */
const ORDER = [
  'trust-contests',
  'trust-accounting-disputes',
  'undue-influence-and-capacity',
  'financial-elder-abuse',
  'breach-of-fiduciary-duty',
  'will-contests',
  'estate-property-disputes',
  'trust-litigation',
  'for-trustees',
];

interface ProblemCardProps {
  area: PracticeArea;
  className?: string;
  style?: CSSProperties;
  lensEvent?: string;
}

export function ProblemCard({ area, className = '', style, lensEvent }: ProblemCardProps) {
  const card = area.card;
  if (!card) throw new Error(`Practice area "${area.slug}" has no homepage card`);
  const Icon = icons[card.icon];
  return (
    <Card
      href={card.href ?? practiceHref(area)}
      className={`flex h-full flex-col ${className}`}
      style={style}
      lensEvent={lensEvent}
    >
      <Icon className="h-6 w-6 text-brass-500" />
      <h3 className="mt-4 font-sans text-h4 text-ink">&ldquo;{card.headline}&rdquo;</h3>
      <p className="mt-2 flex-1 text-small text-ink-3">{bindSectionSigns(card.answer)}</p>
      <p className="mt-4 inline-flex items-center gap-2 text-ui font-semibold text-maroon-700">
        What you can do
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </p>
    </Card>
  );
}

export function ProblemCards() {
  const areas = ORDER.map(getPracticeArea);
  if (areas.length !== 9) throw new Error('Homepage expects 9 problem cards');
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
        <Reveal stagger className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {areas.map((area, i) => (
            <ProblemCard
              key={area.slug}
              area={area}
              className={`${LENS_ORDERED_CLASS} ${oddLastSpan(i, areas.length, 'xl')}`}
              style={lensOrderStyle(area.slug, ORDER, lensConfig.cardsFirst)}
              lensEvent={`card:${area.slug}`}
            />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
