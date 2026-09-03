'use client';

import { CheckIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { CONFLICT_CAVEAT, DONE_KEEP_REFERENCE, DONE_NEXT } from '@/lib/intake/copy';
import { StepFrame } from './StepFrame';
import type { StepProps } from './step-props';

/** Step 9: the reference number in large type, what happens next in three lines, the conflict-check caveat. */
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
      <div className="mt-8">
        <Button variant="secondary" onClick={intake.startOver}>
          Start a new request
        </Button>
      </div>
    </StepFrame>
  );
}
