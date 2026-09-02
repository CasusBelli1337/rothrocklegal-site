'use client';

import { Button } from '@/components/ui/Button';
import { CONFLICT_CAVEAT, REPLY_PROMISE } from '@/lib/intake/copy';
import { StepFrame } from './StepFrame';
import type { StepProps } from './step-props';

/** Step 9: reference number, the reply promise, the conflict-check caveat. */
export function StepDone({ intake }: StepProps) {
  const { result, session, answers } = intake.state;
  const reference = result?.reference ?? session?.reference ?? '';

  return (
    <StepFrame intake={intake} footer={null}>
      <div className="rounded-xl border border-line bg-paper p-5">
        <p className="eyebrow">Your reference</p>
        <p className="mt-2 font-serif text-h2 text-ink tabular">{reference}</p>
      </div>
      <p className="mt-6 text-body text-ink">
        <strong>{REPLY_PROMISE}</strong>{' '}
        {answers.contact.email
          ? `A confirmation is on its way to ${answers.contact.email}.`
          : 'A confirmation email is on its way.'}
      </p>
      {/* The API's nextSteps repeats the reply promise and caveat; the site's copy is canonical. */}
      <p className="mt-4 text-body text-ink-2">{CONFLICT_CAVEAT}</p>
      <p className="mt-4 text-small text-ink-3">
        Keep the reference number in case you need to write to us about this request. Until both
        sides sign an engagement letter, we are not your lawyers, so keep an eye on any dates you
        already know about.
      </p>
      <div className="mt-8">
        <Button variant="secondary" onClick={intake.startOver}>
          Start a new request
        </Button>
      </div>
    </StepFrame>
  );
}
