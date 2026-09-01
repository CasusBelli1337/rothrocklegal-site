import { formatLongDate } from '@/lib/deadlines/dates';
import { describeStatus } from '@/lib/deadlines/summary';
import type { DeadlineResult } from '@/lib/deadlines/types';

const PILL_LABEL: Record<DeadlineResult['status'], string> = {
  open: 'Open',
  urgent: 'Urgent',
  passed: 'Passed',
  'not-started': 'Clock not started',
};

function DateColumn({ result }: { result: DeadlineResult }) {
  if (!result.deadline) {
    return <p className="font-heading text-xl font-semibold text-black">No date yet</p>;
  }
  const days = describeStatus(result);
  return (
    <>
      <p className="text-sm text-navy-light">Estimated deadline</p>
      <p className="font-heading text-xl font-semibold text-black md:text-2xl">
        {formatLongDate(result.deadline)}
      </p>
      <p className="mt-1 text-base font-semibold text-black">
        {days.charAt(0).toUpperCase() + days.slice(1)}
      </p>
    </>
  );
}

function CardHeader({ result }: { result: DeadlineResult }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <span className="wizard-pill">{PILL_LABEL[result.status]}</span>
        <h3
          id={`deadline-${result.id}`}
          className="font-serif-accent mt-2 text-2xl font-semibold text-black"
        >
          {result.label}
        </h3>
        <a
          href={result.statuteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="wizard-link text-sm text-navy-light underline"
        >
          {result.statute}
        </a>
      </div>
      <div className="sm:text-right">
        <DateColumn result={result} />
      </div>
    </div>
  );
}

function CardDetails({ result }: { result: DeadlineResult }) {
  return (
    <dl className="mt-4 space-y-3 text-[15px] leading-relaxed text-navy">
      <div>
        <dt className="font-bold text-black">
          {result.deadline ? 'How we counted' : 'What this means'}
        </dt>
        <dd>{result.explanation}</dd>
      </div>
      <div>
        <dt className="font-bold text-black">The rule</dt>
        <dd>{result.description}</dd>
      </div>
      <div>
        <dt className="font-bold text-black">Why it matters</dt>
        <dd>{result.whyItMatters}</dd>
      </div>
      {result.caveats.length > 0 && (
        <div>
          <dt className="font-bold text-black">Keep in mind</dt>
          <dd>
            <ul className="list-disc space-y-1 pl-5">
              {result.caveats.map((caveat) => (
                <li key={caveat}>{caveat}</li>
              ))}
            </ul>
          </dd>
        </div>
      )}
    </dl>
  );
}

/** One deadline: status, date, how it was counted, the rule, and the caveats. */
export function DeadlineCard({ result, index }: { result: DeadlineResult; index: number }) {
  return (
    <article
      className={`wizard-result wizard-card-enter status-${result.status}`}
      style={{ '--i': index } as React.CSSProperties}
      aria-labelledby={`deadline-${result.id}`}
    >
      <CardHeader result={result} />
      {result.status === 'passed' && (
        <p className="wizard-alert mt-4 text-sm text-black">
          This date has passed. That does not always end the matter: some exceptions exist, for
          example if a notice was defective or never properly served. Talk to a lawyer right away.
        </p>
      )}
      <CardDetails result={result} />
    </article>
  );
}
