'use client';

import { FUNDING_OPTIONS, VALUE_RANGES } from '@/lib/intake/contract';
import { FEE_ESTIMATE_NOTE, FUNDING_LABELS, VALUE_RANGE_LABELS } from '@/lib/intake/copy';
import { ChoiceCards } from './ChoiceCards';
import { Field, TextArea, hintId } from './FormFields';
import { StepFrame } from './StepFrame';
import type { StepProps } from './step-props';

const VALUE_OPTIONS = VALUE_RANGES.map((value) => ({ value, label: VALUE_RANGE_LABELS[value] }));
const FUNDING_CHOICES = FUNDING_OPTIONS.map((value) => ({ value, label: FUNDING_LABELS[value] }));

/** Step 6: value in dispute, how the client would pay, urgency, and the outcome they want. */
export function StepScope({ intake }: StepProps) {
  const { valueRange, funding, urgencyNote, desiredOutcome } = intake.state.answers;
  const patch = intake.patchAnswers;

  return (
    <StepFrame intake={intake}>
      <div className="space-y-8">
        <ChoiceCards
          name="value-range"
          legend="Roughly how much is in dispute?"
          hint="The house, the accounts, the business. A guess is fine."
          options={VALUE_OPTIONS}
          value={valueRange ?? ''}
          onChange={(value) => patch({ valueRange: value })}
          columns={2}
        />
        <div>
          <ChoiceCards
            name="funding"
            legend="How would you pay for a lawyer?"
            options={FUNDING_CHOICES}
            value={funding ?? ''}
            onChange={(value) => patch({ funding: value })}
          />
          <p className="mt-3 text-small text-ink-2">{FEE_ESTIMATE_NOTE}</p>
        </div>
        <Field
          id="urgency"
          label="Is anything about to happen?"
          optional
          hint="A hearing, a sale, a letter with a date in it, or a deadline someone mentioned."
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
          label="What do you want to happen?"
          optional
          hint="In your own words. An accounting, the house back, a fair share, someone removed as trustee."
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
    </StepFrame>
  );
}
