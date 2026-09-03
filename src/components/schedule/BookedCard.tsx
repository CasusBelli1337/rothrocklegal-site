import { CheckIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import type { BookedSlot } from '@/lib/public/contract';
import { SCHEDULE_COPY } from '@/lib/public/copy';

interface BookedCardProps {
  booked: BookedSlot;
  haveReady: readonly string[];
}

/** After booking (now or on an earlier visit): the Meet link, what was emailed, what to have ready. */
export function BookedCard({ booked, haveReady }: BookedCardProps) {
  const copy = SCHEDULE_COPY.booked;
  return (
    <div className="wizard-enter border border-line bg-white p-5 sm:p-8">
      {booked.meetLink ? (
        <Button href={booked.meetLink} className="public-primary w-full sm:w-auto">
          {copy.meet}
        </Button>
      ) : (
        <p className="text-body text-ink">{copy.noMeet}</p>
      )}
      <p className="mt-4 text-body text-ink-2">{copy.emailed}</p>
      <h2 className="mt-8 font-serif text-h3 text-ink">{copy.haveReadyHeading}</h2>
      <p className="mt-2 text-body text-ink-2">{copy.haveReadyIntro}</p>
      <ul className="mt-4 space-y-3">
        {haveReady.map((line) => (
          <li key={line} className="flex items-start gap-3 text-body text-ink">
            <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-brass-500" />
            {line}
          </li>
        ))}
      </ul>
      <p className="mt-8 border-t border-line pt-5 text-small text-ink-3">{copy.notLawyersYet}</p>
    </div>
  );
}
