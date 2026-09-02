'use client';

import { useState } from 'react';
import { errorMessage, saveFollowUp, submitIntake } from '@/lib/intake/api';
import type { FollowUpAnswer, FollowUpModule, IntakeFile } from '@/lib/intake/contract';
import { validateStep } from '@/lib/intake/state';
import { ModuleRenderer } from './ModuleRenderer';
import { StepFrame, StepNav } from './StepFrame';
import type { StepProps } from './step-props';

/** Upload modules answer themselves with the ids of the files sent to their slot. */
export function withUploadAnswers(
  modules: FollowUpModule[],
  answers: Record<string, FollowUpAnswer>,
  files: IntakeFile[],
): Record<string, FollowUpAnswer> {
  const next = { ...answers };
  for (const item of modules) {
    if (item.type !== 'upload') continue;
    const ids = files.filter((f) => f.slot === item.id).map((f) => f.id);
    if (ids.length > 0) next[item.id] = ids;
  }
  return next;
}

/** Step 8: the evaluation's client view and its follow-up modules; Submit sends everything. */
export function StepFollowUp({ intake, uploads }: StepProps) {
  const { evaluation, followUpAnswers, session, files } = intake.state;
  const [sending, setSending] = useState(false);
  const modules = evaluation?.modules ?? [];

  const setAnswer = (id: string, value: FollowUpAnswer | undefined) => {
    if (value !== undefined) {
      intake.setFollowUpAnswer(id, value);
      return;
    }
    intake.update((s) => {
      const rest = { ...s.followUpAnswers };
      delete rest[id];
      return { ...s, followUpAnswers: rest };
    });
  };

  const submit = async () => {
    const answers = withUploadAnswers(modules, followUpAnswers, files);
    const problem = validateStep('follow-up', { ...intake.state, followUpAnswers: answers });
    if (problem) {
      intake.setError(problem);
      return;
    }
    if (!session) {
      intake.setError('Your session expired. Go back to the start and try again.');
      return;
    }
    setSending(true);
    try {
      await saveFollowUp(session, answers);
      intake.finish(await submitIntake(session));
    } catch (caught) {
      intake.setError(errorMessage(caught));
      setSending(false);
    }
  };

  return (
    <StepFrame
      intake={intake}
      onSubmit={() => void submit()}
      footer={<StepNav intake={intake} continueLabel="Send" busy={sending} />}
    >
      {evaluation && (
        <div className="wizard-banner">
          <h3 className="font-serif text-h3 text-ink">{evaluation.headline}</h3>
          <p className="mt-2 text-body text-ink-2">{evaluation.whatWeUnderstood}</p>
        </div>
      )}
      {modules.length > 0 ? (
        <>
          <p className="mt-6 text-small text-ink-3">
            Answer what you can. Anything marked optional can wait.
          </p>
          <div className="mt-4 space-y-4">
            {modules.map((module) => (
              <ModuleRenderer
                key={module.id}
                module={module}
                value={followUpAnswers[module.id]}
                onChange={(value) => setAnswer(module.id, value)}
                uploads={uploads}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-6 text-body text-ink-2">
          We have what we need for now. Send it, and we will take it from here.
        </p>
      )}
    </StepFrame>
  );
}
