'use client';

import type { FollowUpAnswer } from '@/lib/intake/contract';
import { ModuleRenderer } from './ModuleRenderer';
import { StepFrame } from './StepFrame';
import type { StepProps } from './step-props';

/**
 * Step 7, only when the evaluation left questions: its headline and "what we
 * understood", then the modules (at most six), every one optional. Continue
 * goes to the review; nothing is sent from here.
 */
export function StepFollowUp({ intake, uploads }: StepProps) {
  const { evaluation, followUpAnswers } = intake.state;
  const modules = evaluation?.modules ?? [];

  const setAnswer = (id: string, value: FollowUpAnswer | undefined) => {
    if (value === undefined) intake.clearFollowUpAnswer(id);
    else intake.setFollowUpAnswer(id, value);
  };

  return (
    <StepFrame intake={intake}>
      {evaluation && (
        <div className="wizard-banner mb-5">
          <h3 className="font-serif text-h3 text-ink">{evaluation.headline}</h3>
          <p className="mt-2 text-body text-ink-2">{evaluation.whatWeUnderstood}</p>
        </div>
      )}
      <div className="space-y-4">
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
    </StepFrame>
  );
}
