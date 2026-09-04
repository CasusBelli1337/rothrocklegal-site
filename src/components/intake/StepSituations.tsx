'use client';

import { useEffect } from 'react';
import { CheckIcon } from '@/components/icons';
import { lensConfig } from '@/config/lens';
import { SITUATIONS, type SituationKey } from '@/lib/intake/contract';
import { STORY_READ_COPY } from '@/lib/intake/copy';
import { needsStoryRead } from '@/lib/intake/readings';
import type { IntakeController } from '@/lib/intake/use-intake';
import { useTriage } from '@/lib/intake/use-triage';
import { claimSessionFlag } from '@/lib/lens/store';
import { useLens } from '@/lib/lens/useLens';
import { ReadingLine } from './Reading';
import { StepFrame, StepNav } from './StepFrame';
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
      className={`flex min-h-14 items-center gap-3 border bg-white px-4 py-2 text-left text-body transition-colors ${
        pressed
          ? 'border-maroon-700 bg-sand text-ink shadow-[inset_0_0_0_1px_var(--color-maroon-700)]'
          : 'border-line-strong text-ink hover:border-maroon-500'
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid h-6 w-6 shrink-0 place-items-center border ${
          pressed ? 'border-maroon-900 bg-maroon-900 text-white' : 'border-line-strong'
        }`}
      >
        {pressed && <CheckIcon className="h-4 w-4" />}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

/** Pass 1 runs once when the screen opens with a story the model has not read. */
function useStoryRead(intake: IntakeController): boolean {
  const { state } = intake;
  const reading = needsStoryRead(state);
  const triage = useTriage({
    session: state.session,
    answers: state.answers,
    onReady: intake.receiveStoryRead,
    onUnavailable: intake.markStoryReadUnavailable,
  });
  useEffect(() => {
    if (reading && triage.phase === 'idle') void triage.start();
  }, [reading, triage]);
  return reading;
}

/** The multi-select cards. Clicks feed the lens (docs/LENS.md §2); without a read, a trustee-lens visitor finds theirs ticked once. */
function SituationCards({ intake, manual }: { intake: IntakeController; manual: boolean }) {
  const { situations } = intake.state.answers;
  const { lens, record } = useLens();
  const { patchAnswers } = intake;
  const preselect = lensConfig.intakePreselect[lens];

  useEffect(() => {
    if (!manual || !preselect || situations.length > 0) return;
    if (claimSessionFlag(lensConfig.seededKey)) patchAnswers({ situations: [...preselect] });
  }, [manual, preselect, situations.length, patchAnswers]);

  const toggle = (key: SituationKey) => {
    const adding = !situations.includes(key);
    if (adding) record(`intake:situation:${key}`);
    patchAnswers({
      situations: adding ? [...situations, key] : situations.filter((k) => k !== key),
    });
  };

  return (
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
  );
}

/**
 * Step 3: the model reads the story (pass 1) while one line shows it working;
 * then "what we understood" and the situation cards, pre-ticked from the read.
 * When the read is unavailable the same cards show unticked.
 */
export function StepSituations({ intake }: StepProps) {
  const reading = useStoryRead(intake);
  const { storyRead } = intake.state;

  if (reading) {
    return (
      <StepFrame intake={intake} lead={null} footer={<StepNav intake={intake} busy />}>
        <ReadingLine text={STORY_READ_COPY.reading} />
      </StepFrame>
    );
  }

  return (
    <StepFrame intake={intake} lead={null}>
      {storyRead && (
        <div className="wizard-banner mb-4">
          <h3 className="text-small font-semibold text-ink">{STORY_READ_COPY.understoodTitle}</h3>
          <p className="mt-1 text-body text-ink-2">{storyRead.whatWeUnderstood}</p>
        </div>
      )}
      <p className="mb-4 text-body text-ink-2">
        {storyRead ? STORY_READ_COPY.confirm : STORY_READ_COPY.manual}
      </p>
      <SituationCards intake={intake} manual={storyRead === null} />
    </StepFrame>
  );
}
