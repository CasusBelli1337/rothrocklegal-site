'use client';

import { FUNDING_OPTIONS, VALUE_RANGES } from '@/lib/intake/contract';
import {
  FEE_ESTIMATE_NOTE,
  FUNDING_LABELS,
  SCOPE_COPY,
  VALUE_RANGE_LABELS,
} from '@/lib/intake/copy';
import { ChoiceCards } from './ChoiceCards';
import { Field, TextArea, hintId } from './FormFields';
import { StepFrame } from './StepFrame';
import type { StepProps } from './step-props';

const VALUE_OPTIONS = VALUE_RANGES.map((value) => ({ value, label: VALUE_RANGE_LABELS[value] }));
const FUNDING_CHOICES = FUNDING_OPTIONS.map((value) => ({ value, label: FUNDING_LABELS[value] }));

/**
 * Step 6: how the client would pay, what is about to happen, and the outcome
 * they want. The amount in dispute is asked only when the evaluation could not
 * read it (or did not run): most families do not know it.
 */
export function StepScope({ intake }: StepProps) {
  const { valueRange, funding, urgencyNote, desiredOutcome } = intake.state.answers;
  const { evaluation } = intake.state;
  const askValue = evaluation === null || evaluation.askValue;
  const patch = intake.patchAnswers;

  return (
    <StepFrame intake={intake}>
      <div className="space-y-6">
        {askValue && (
          <ChoiceCards
            name="value-range"
            legend={SCOPE_COPY.valueLegend}
            hint={SCOPE_COPY.valueHint}
            options={VALUE_OPTIONS}
            value={valueRange ?? ''}
            onChange={(value) => patch({ valueRange: value })}
            columns={2}
          />
        )}
        <div>
          <ChoiceCards
            name="funding"
            legend={SCOPE_COPY.fundingLegend}
            options={FUNDING_CHOICES}
            value={funding ?? ''}
            onChange={(value) => patch({ funding: value })}
          />
          <p className="mt-2 text-small text-ink-2">{FEE_ESTIMATE_NOTE}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="urgency"
            label={SCOPE_COPY.urgencyLabel}
            optional
            hint={SCOPE_COPY.urgencyHint}
          >
            <TextArea
              id="urgency"
              value={urgencyNote ?? ''}
              onChange={(value) => patch({ urgencyNote: value || undefined })}
              rows={3}
              describedBy={hintId('urgency')}
            />
          </Field>
          <Field
            id="outcome"
            label={SCOPE_COPY.outcomeLabel}
            optional
            hint={SCOPE_COPY.outcomeHint}
          >
            <TextArea
              id="outcome"
              value={desiredOutcome ?? ''}
              onChange={(value) => patch({ desiredOutcome: value || undefined })}
              rows={3}
              describedBy={hintId('outcome')}
            />
          </Field>
        </div>
      </div>
    </StepFrame>
  );
}
