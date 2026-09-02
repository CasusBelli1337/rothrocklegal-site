'use client';

import { useCallback, useState } from 'react';
import { CheckIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { errorMessage, submitIntake } from '@/lib/intake/api';
import type { EvaluationClientView } from '@/lib/intake/contract';
import { EVALUATION_UNAVAILABLE } from '@/lib/intake/copy';
import type { IntakeState, StepId } from '@/lib/intake/state';
import {
  EVALUATION_STAGES,
  stageIndex,
  useEvaluation,
  type EvaluationPhase,
} from '@/lib/intake/use-evaluation';
import { reviewRows } from './review-rows';
import { StepFrame, StepNav } from './StepFrame';
import type { StepProps } from './step-props';

function Summary({ state, onEdit }: { state: IntakeState; onEdit(step: StepId): void }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {reviewRows(state).map((row) => (
        <div key={row.label} className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr_auto] sm:gap-6">
          <dt className="text-small font-semibold text-ink">{row.label}</dt>
          <dd className="space-y-1 text-body text-ink-2">
            {row.lines.length > 0 ? (
              row.lines.map((line, i) => (
                <p key={i} className="whitespace-pre-line break-words">
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
              className="text-small font-medium text-maroon-700 underline underline-offset-3 hover:text-maroon-600"
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

/** The three status lines that move while the server reads the intake. */
function Stages({ phase }: { phase: EvaluationPhase }) {
  const active = stageIndex(phase) ?? -1;
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <ol className="space-y-3">
        {EVALUATION_STAGES.map((line, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li
              key={line}
              className={`flex items-center gap-3 text-body ${current ? 'font-semibold text-ink' : done ? 'text-ink-2' : 'text-ink-4'}`}
            >
              {done ? (
                <CheckIcon className="h-5 w-5 text-success" />
              ) : current ? (
                <span
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin rounded-full border-2 border-maroon-700 border-t-transparent"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="h-5 w-5 rounded-full border border-line-strong"
                />
              )}
              {line}
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-small text-ink-3">
        This usually takes two to five minutes while we read everything you sent. Please keep this
        page open.
      </p>
    </div>
  );
}

/** Step 7: the summary, "Send for review", and the staged progress while the evaluation runs. */
export function StepReview({ intake }: StepProps) {
  const { state } = intake;
  const [sending, setSending] = useState(false);
  const { setEvaluation, goTo, finish, setError } = intake;

  const onReady = useCallback(
    (view: EvaluationClientView) => {
      setEvaluation(view);
      goTo('follow-up');
    },
    [setEvaluation, goTo],
  );
  const evaluation = useEvaluation({ session: state.session, answers: state.answers, onReady });
  const inFlight = stageIndex(evaluation.phase) !== null;

  const sendWithoutFollowUp = async () => {
    if (!state.session) return;
    setSending(true);
    try {
      finish(await submitIntake(state.session));
    } catch (caught) {
      setError(errorMessage(caught));
      setSending(false);
    }
  };

  const footer = inFlight ? null : evaluation.phase === 'timeout' ? (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <Button onClick={() => void sendWithoutFollowUp()} loading={sending}>
        Send what I have
      </Button>
    </div>
  ) : (
    <StepNav
      intake={intake}
      continueLabel={evaluation.phase === 'error' ? 'Try again' : 'Send for review'}
    />
  );

  return (
    <StepFrame intake={intake} onSubmit={() => void evaluation.start()} footer={footer}>
      {inFlight ? <Stages phase={evaluation.phase} /> : <Summary state={state} onEdit={goTo} />}
      {evaluation.phase === 'error' && (
        <p role="alert" className="mt-4 text-small font-semibold text-error">
          {evaluation.error}
        </p>
      )}
      {evaluation.phase === 'timeout' && (
        <div className="wizard-banner mt-6" role="status">
          <p className="text-body text-ink">
            {EVALUATION_UNAVAILABLE} You can send what you have now.
          </p>
        </div>
      )}
    </StepFrame>
  );
}
