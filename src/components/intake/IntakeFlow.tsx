'use client';

import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { ping } from '@/lib/intake/api';
import type { IntakeFile } from '@/lib/intake/contract';
import { VOICE_NOTE_SLOT } from '@/lib/intake/document-slots';
import { NUMBERED_STEP_COUNT, stepNumber, type StepId } from '@/lib/intake/state';
import { useIntake } from '@/lib/intake/use-intake';
import { useUploads } from '@/lib/intake/use-uploads';
import '@/components/wizard/wizard.css';
import { Fallback } from './Fallback';
import { ProgressBar } from './ProgressBar';
import { StepContact } from './StepContact';
import { StepDocuments } from './StepDocuments';
import { StepDone } from './StepDone';
import { StepFollowUp } from './StepFollowUp';
import { StepParties } from './StepParties';
import { StepReview } from './StepReview';
import { StepScope } from './StepScope';
import { StepSituations } from './StepSituations';
import { StepStart } from './StepStart';
import { StepStory } from './StepStory';
import type { StepProps } from './step-props';

type ApiStatus = 'checking' | 'online' | 'offline';

/** One screen component per step (INTAKE-SPEC §2). */
const STEPS: Record<StepId, ComponentType<StepProps>> = {
  start: StepStart,
  contact: StepContact,
  situations: StepSituations,
  parties: StepParties,
  story: StepStory,
  documents: StepDocuments,
  scope: StepScope,
  review: StepReview,
  'follow-up': StepFollowUp,
  done: StepDone,
};

/** Pings the API once on mount; the answer picks the full flow or the fallback form. */
function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>('checking');
  useEffect(() => {
    let alive = true;
    ping().then((ok) => {
      if (alive) setStatus(ok ? 'online' : 'offline');
    });
    return () => {
      alive = false;
    };
  }, []);
  return status;
}

function Checking() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex items-center gap-3 rounded-xl border border-line bg-white p-6 text-body text-ink-2 sm:p-10"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-maroon-700 border-t-transparent"
      />
      Checking our connection…
    </div>
  );
}

/** The "Request a consult" flow: API check, then one screen per step with progress and autosave. */
export function IntakeFlow() {
  const intake = useIntake();
  const status = useApiStatus();
  const { addFile, patchAnswers, removeFile } = intake;

  const onUploaded = useCallback(
    (file: IntakeFile) => {
      addFile(file);
      if (file.slot === VOICE_NOTE_SLOT) patchAnswers({ voiceNoteFileId: file.id });
    },
    [addFile, patchAnswers],
  );
  const uploads = useUploads(intake.state.session, intake.state.files, onUploaded, removeFile);

  if (status === 'checking' || !intake.hydrated) return <Checking />;
  if (status === 'offline') return <Fallback />;

  const { step } = intake.state;
  const Step = STEPS[step];
  const number = stepNumber(step);
  return (
    <div className="wizard rounded-xl border border-line bg-white p-6 sm:p-10">
      {number !== null && (
        <div className="mb-8">
          <ProgressBar step={number} total={NUMBERED_STEP_COUNT} />
        </div>
      )}
      <div key={step}>
        <Step intake={intake} uploads={uploads} />
      </div>
    </div>
  );
}
