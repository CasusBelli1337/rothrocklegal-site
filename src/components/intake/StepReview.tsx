'use client';

import { useState } from 'react';
import { errorMessage, saveFollowUp, submitIntake } from '@/lib/intake/api';
import { REVIEW_NOTE } from '@/lib/intake/copy';
import { withUploadAnswers } from '@/lib/intake/follow-up';
import { hasFollowUp, type IntakeState, type StepId } from '@/lib/intake/state';
import { reviewRows } from './review-rows';
import { StepFrame, StepNav } from './StepFrame';
import type { StepProps } from './step-props';

function Summary({ state, onEdit }: { state: IntakeState; onEdit(step: StepId): void }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {reviewRows(state).map((row) => (
        <div key={row.label} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr_auto] sm:gap-6">
          <dt className="text-small font-semibold text-ink">{row.label}</dt>
          <dd className="space-y-0.5 text-body text-ink-2">
            {row.lines.length > 0 ? (
              row.lines.map((line, i) => (
                <p key={i} className="break-words whitespace-pre-line">
                  {line}
                </p>
              ))
            ) : (
              <p className="text-ink-3">Nothing entered</p>
            )}
          </dd>
          <dd>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="tap-link text-small font-medium text-maroon-700 underline underline-offset-3 hover:text-maroon-600"
              aria-label={`Edit ${row.label}`}
            >
              Edit
            </button>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Step 8: the compact summary with Edit links; Send saves the follow-up answers (when any) and submits. */
export function StepReview({ intake }: StepProps) {
  const { state } = intake;
  const [sending, setSending] = useState(false);

  const send = async () => {
    const { session } = state;
    if (!session) {
      intake.setError('Your session expired. Go back to the start and try again.');
      return;
    }
    setSending(true);
    try {
      if (hasFollowUp(state)) {
        const modules = state.evaluation?.modules ?? [];
        await saveFollowUp(session, withUploadAnswers(modules, state.followUpAnswers, state.files));
      }
      intake.finish(await submitIntake(session));
    } catch (caught) {
      intake.setError(errorMessage(caught));
      setSending(false);
    }
  };

  return (
    <StepFrame
      intake={intake}
      onSubmit={() => void send()}
      footer={<StepNav intake={intake} continueLabel="Send" busy={sending} />}
    >
      <Summary state={state} onEdit={intake.goTo} />
      <p className="mt-4 text-small text-ink-3">{REVIEW_NOTE}</p>
    </StepFrame>
  );
}
