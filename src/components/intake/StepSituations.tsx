'use client';

import { CheckIcon } from '@/components/icons';
import { SITUATIONS, type Relationship, type SituationKey } from '@/lib/intake/contract';
import { RELATIONSHIP_OPTIONS } from '@/lib/intake/copy';
import { Field, SelectInput } from './FormFields';
import { StepFrame } from './StepFrame';
import type { StepProps } from './step-props';

function SituationCard({
  label,
  pressed,
  onToggle,
}: {
  label: string;
  pressed: boolean;
  onToggle(): void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={`flex min-h-16 items-center gap-3 rounded-md border bg-white px-4 py-3 text-left text-body transition-colors ${
        pressed
          ? 'border-maroon-700 bg-maroon-50 text-ink shadow-[inset_0_0_0_1px_var(--color-maroon-700)]'
          : 'border-line-strong text-ink hover:border-maroon-500'
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
          pressed ? 'border-maroon-700 bg-maroon-700 text-white' : 'border-line-strong'
        }`}
      >
        {pressed && <CheckIcon className="h-4 w-4" />}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

/** Step 2: the nine situations as multi-select cards, plus the relationship. */
export function StepSituations({ intake }: StepProps) {
  const { situations, relationship } = intake.state.answers;
  const toggle = (key: SituationKey) =>
    intake.patchAnswers({
      situations: situations.includes(key)
        ? situations.filter((k) => k !== key)
        : [...situations, key],
    });

  return (
    <StepFrame intake={intake}>
      <div className="grid gap-3 md:grid-cols-2" role="group" aria-label="What is going on">
        {SITUATIONS.map((situation) => (
          <SituationCard
            key={situation.key}
            label={situation.label}
            pressed={situations.includes(situation.key)}
            onToggle={() => toggle(situation.key)}
          />
        ))}
      </div>
      <div className="mt-8 sm:max-w-[24rem]">
        <Field
          id="relationship"
          label="Your relationship to the person who died, or to the estate"
          optional
        >
          <SelectInput<Relationship>
            id="relationship"
            value={relationship ?? ''}
            onChange={(value) => intake.patchAnswers({ relationship: value || undefined })}
            options={RELATIONSHIP_OPTIONS}
          />
        </Field>
      </div>
    </StepFrame>
  );
}
