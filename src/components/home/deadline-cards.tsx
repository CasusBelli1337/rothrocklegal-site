import Link from 'next/link';
import { ArrowRightIcon, ChevronDownIcon } from '@/components/icons';
import type { DeadlineCard, DeadlineCards } from '@/config/lens-copy';
import { bindSectionSigns } from '@/lib/typography';

const moreLink =
  'tap-link inline-flex items-center gap-2 text-ui font-semibold text-maroon-700 hover:text-maroon-600';

/** Native <details>: works without JavaScript; the chevron turns while it is open. */
function Disclosure({ more }: { more: NonNullable<DeadlineCard['more']> }) {
  return (
    <details className="group mt-2">
      <summary className={`${moreLink} min-h-11 cursor-pointer`}>
        {more.summary}
        <ChevronDownIcon className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" />
      </summary>
      {more.body && <p className="text-body text-ink-2">{bindSectionSigns(more.body)}</p>}
      {more.items && (
        <ol className="list-decimal space-y-1 pl-5 text-body text-ink-2">
          {more.items.map((item) => (
            <li key={item}>{bindSectionSigns(item)}</li>
          ))}
        </ol>
      )}
      <Link href={more.link.href} className={`${moreLink} mt-3`}>
        {more.link.label}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </details>
  );
}

/** A wrapped label breaks after the dot, never before it, and keeps "Probate Code" whole. */
function bindLabel(label: string): string {
  return bindSectionSigns(
    label.replace(' · ', '\u00a0· ').replace('Probate Code', 'Probate\u00a0Code'),
  );
}

/** One clock: hairline above it on phones, to its left from md. */
function DeadlineItem({ card, index }: { card: DeadlineCard; index: number }) {
  const divider =
    index === 0 ? '' : 'border-t border-line pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-8';
  return (
    <div className={divider}>
      <p className="eyebrow text-balance leading-snug">{bindLabel(card.label)}</p>
      <h3 className="mt-3 font-sans text-h4 text-ink">{card.question}</h3>
      <p className="mt-3 text-body text-ink-2">{bindSectionSigns(card.body)}</p>
      {card.more && <Disclosure more={card.more} />}
    </div>
  );
}

/** One lens variant of the card set: the three clocks, then the teaser strip under them. */
export function renderDeadlineCards({ cards, teaser }: DeadlineCards) {
  return (
    <>
      <div className="grid gap-8 md:grid-cols-3">
        {cards.map((card, index) => (
          <DeadlineItem key={card.label} card={card} index={index} />
        ))}
      </div>
      <div className="mt-10 border-l-4 border-brass-400 pl-5">
        <p className="font-sans text-h4 text-ink">{teaser.lead}</p>
        <p className="mt-2 max-w-[70ch] text-body text-ink-2">{bindSectionSigns(teaser.body)}</p>
      </div>
    </>
  );
}
