'use client';

import Link from 'next/link';
import { CheckIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { ADDITION_PAGE_PATH } from '@/lib/intake/contract';
import { ADD_LATER_COPY, CONFLICT_CAVEAT, DONE_KEEP_REFERENCE, DONE_NEXT } from '@/lib/intake/copy';
import { PackageCard } from './PackageCard';
import { StepFrame, confirmStartOver } from './StepFrame';
import type { StepProps } from './step-props';

/**
 * Step 9: the reference number in large type, the package card, what happens
 * next in three lines, the conflict-check caveat, and where to add to the
 * request later (Arthur, 2026-10-13: "Add to your request").
 */
export function StepDone({ intake }: StepProps) {
  const { result, session, answers } = intake.state;
  const reference = result?.reference ?? session?.reference ?? '';

  return (
    <StepFrame intake={intake} footer={null}>
      <div className="border border-line bg-paper p-5 sm:p-6">
        <p className="eyebrow">Your reference number</p>
        <p className="mt-2 font-serif text-h1 text-ink tabular">{reference}</p>
        <p className="mt-3 text-body text-ink-2">
          {answers.contact.email
            ? `A confirmation with this number is on its way to ${answers.contact.email}.`
            : 'A confirmation with this number is on its way to your email.'}
        </p>
      </div>
      <PackageCard session={session} email={answers.contact.email} />
      <h3 className="mt-8 text-body font-semibold text-ink">What happens next</h3>
      <ol className="mt-3 space-y-3">
        {DONE_NEXT.map((line) => (
          <li key={line} className="flex items-start gap-3 text-body text-ink">
            <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-success" />
            {line}
          </li>
        ))}
      </ol>
      {/* The API's nextSteps repeats the reply promise and caveat; the site's copy is canonical. */}
      <p className="mt-6 text-body text-ink-2">{CONFLICT_CAVEAT}</p>
      <p className="mt-4 text-small text-ink-3">{DONE_KEEP_REFERENCE}</p>
      <p className="mt-4 text-body text-ink-2">
        {ADD_LATER_COPY.doneLead}{' '}
        <Link
          href={ADDITION_PAGE_PATH}
          className="tap-link font-medium break-words text-maroon-700 underline underline-offset-3 hover:text-maroon-600"
        >
          {ADD_LATER_COPY.doneLink}
        </Link>
        .
      </p>
      <div className="mt-8">
        <Button variant="secondary" onClick={() => confirmStartOver(intake)}>
          Start a new request
        </Button>
      </div>
    </StepFrame>
  );
}
