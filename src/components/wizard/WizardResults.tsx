'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { ContactForm } from '@/components/forms/ContactForm';
import { Button } from '@/components/ui/Button';
import { consultCta, site } from '@/config/site';
import { computeDeadlines, hasUrgentOrPassed } from '@/lib/deadlines/compute';
import { buildSummary } from '@/lib/deadlines/summary';
import type { DeadlineResult, WizardAnswers } from '@/lib/deadlines/types';
import { DeadlineCard } from './DeadlineCard';

interface WizardResultsProps {
  answers: WizardAnswers;
  today: string;
  /** Move focus to the results heading when they appear after the last step. */
  focusOnMount: boolean;
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
        Send us the form below and we will look at your situation.
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

function NextStep({ summary }: { summary: string }) {
  return (
    <div className="mt-14 rounded-xl border border-line bg-white p-6 sm:p-10">
      <p className="eyebrow">Next step</p>
      <h2 className="mt-3 font-serif text-h2 text-ink">Send us this summary</h2>
      <p className="mt-3 mb-8 max-w-[60ch] text-body text-ink-2">
        Your answers and the estimated dates are already filled in below. Add your name and how to
        reach you, and send it. {site.replyPromise} Rather say it out loud or upload documents?{' '}
        <Link
          href={consultCta.href}
          className="font-semibold text-maroon-700 underline underline-offset-3"
        >
          Request a consult instead
        </Link>
        .
      </p>
      <ContactForm initialMessage={summary} />
    </div>
  );
}

/** Every deadline that may apply, soonest first, then the prefilled contact form. */
export function WizardResults({
  answers,
  today,
  focusOnMount,
  onEdit,
  onStartOver,
}: WizardResultsProps) {
  const results = useMemo(() => computeDeadlines(answers, today), [answers, today]);
  const summary = useMemo(() => buildSummary(answers, results), [answers, results]);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  return (
    <section aria-labelledby="wizard-results-heading" className="wizard-enter">
      <p className="eyebrow">Your results</p>
      <h2
        id="wizard-results-heading"
        ref={headingRef}
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
      <NextStep summary={summary} />
    </section>
  );
}
