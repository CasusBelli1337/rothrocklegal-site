'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { consultCta, site } from '@/config/site';
import { computeDeadlines, hasUrgentOrPassed } from '@/lib/deadlines/compute';
import type { DeadlineResult, WizardAnswers } from '@/lib/deadlines/types';
import { DeadlineCard } from './DeadlineCard';

/** The results heading's id: DeadlineWizard focuses it when the results appear. */
export const RESULTS_HEADING_ID = 'wizard-results-heading';

interface WizardResultsProps {
  answers: WizardAnswers;
  today: string;
  onEdit(): void;
  onStartOver(): void;
}

function ActNow() {
  return (
    <div className="wizard-alert mt-4 flex flex-wrap items-center justify-between gap-4">
      <p className="text-body font-semibold text-ink">
        At least one deadline is close or has already passed. Don&rsquo;t wait.
      </p>
      <Button href={consultCta.href}>{consultCta.label}</Button>
    </div>
  );
}

function ResultsList({ results }: { results: DeadlineResult[] }) {
  if (results.length === 0) {
    return (
      <p className="mt-6 text-body text-ink-2">
        We could not match your answers to a deadline. That does not mean there isn&rsquo;t one.
        Request a consult below and we will look at your situation.
      </p>
    );
  }
  return (
    <>
      <ol className="mt-6 space-y-5" aria-label="Deadlines, soonest first">
        {results.map((result, index) => (
          <li key={result.id}>
            <DeadlineCard result={result} index={index} />
          </li>
        ))}
      </ol>
      <p className="mt-6 text-small text-ink-3">
        Days are calendar days. When a last day lands on a weekend or a court holiday, California
        law moves it to the next court day (Code of Civil Procedure &sect; 12a); we show the moved
        date and say so. Act before the earlier date to be safe.
      </p>
    </>
  );
}

function NextStep() {
  return (
    <div className="mt-14 border border-line bg-white p-6 sm:p-10">
      <p className="eyebrow">Next step</p>
      <h2 className="mt-3 font-serif text-h2 text-ink">Bring these dates to a consult request</h2>
      <p className="mt-3 max-w-[60ch] text-body text-ink-2">
        Request a consult, tell us what happened in writing or by voice, and mention the dates
        above. We run a conflict check. {site.replyPromise}
      </p>
      <Button href={consultCta.href} className="mt-8">
        {consultCta.label}
      </Button>
    </div>
  );
}

/** Every deadline that may apply, soonest first, then the consult request panel. */
export function WizardResults({ answers, today, onEdit, onStartOver }: WizardResultsProps) {
  const results = useMemo(() => computeDeadlines(answers, today), [answers, today]);

  return (
    <section aria-labelledby={RESULTS_HEADING_ID} className="wizard-enter">
      <p className="eyebrow">Your results</p>
      <h2
        id={RESULTS_HEADING_ID}
        tabIndex={-1}
        className="mt-3 font-serif text-h2 text-ink outline-none"
      >
        Deadlines that may apply to you
      </h2>
      <p role="note" className="wizard-banner mt-6 text-body text-ink">
        <strong>These are estimates from what you told us.</strong> Deadlines depend on facts we
        haven&rsquo;t seen. Contact us before relying on any date.
      </p>
      {hasUrgentOrPassed(results) && <ActNow />}
      <ResultsList results={results} />
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onEdit}>
          Change my answers
        </Button>
        <Button variant="ghost" onClick={onStartOver}>
          Start over
        </Button>
      </div>
      <NextStep />
    </section>
  );
}
