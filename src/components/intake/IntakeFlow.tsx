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

/** The "Request a consult" flow: one screen per step with progress and autosave; an API check runs alongside. */
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

  // The first screen needs no server, so it renders at once (also in the static HTML). A short
  // placeholder that later grew into the form pushed everything below it down (CLS 0.17 on phones).
  // Only an offline answer swaps in the fallback; a saved session restores its step after hydration.
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
