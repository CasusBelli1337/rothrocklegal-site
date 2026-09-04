'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { ping } from '@/lib/intake/api';
import { VOICE_NOTE_SLOT, type IntakeFile } from '@/lib/intake/contract';
import { minutesToGo } from '@/lib/intake/copy';
import { numberedStepCount, stepNumber, visibleSteps, type StepId } from '@/lib/intake/state';
import { useIntake, type IntakeController } from '@/lib/intake/use-intake';
import { useResume } from '@/lib/intake/use-resume';
import { useUploads } from '@/lib/intake/use-uploads';
import { revealPanel } from '@/lib/reveal-panel';
import '@/components/wizard/wizard.css';
import './intake.css';
import { Fallback } from './Fallback';
import { ProgressBar } from './ProgressBar';
import { ResumeNotice } from './ResumeNotice';
import { StepContact } from './StepContact';
import { StepDocuments } from './StepDocuments';
import { StepDone } from './StepDone';
import { StepFollowUp } from './StepFollowUp';
import { STEP_HEADING_ID } from './StepFrame';
import { StepParties } from './StepParties';
import { StepReview } from './StepReview';
import { StepScope } from './StepScope';
import { StepSituations } from './StepSituations';
import { StepStart } from './StepStart';
import { StepStory } from './StepStory';
import type { StepProps } from './step-props';

type ApiStatus = 'checking' | 'online' | 'offline';

/** One screen component per step (v3 order). */
const STEPS: Record<StepId, ComponentType<StepProps>> = {
  start: StepStart,
  contact: StepContact,
  story: StepStory,
  situations: StepSituations,
  documents: StepDocuments,
  parties: StepParties,
  scope: StepScope,
  'follow-up': StepFollowUp,
  review: StepReview,
  done: StepDone,
};

/** Pings the API once on mount; the answer picks the full flow or the fallback notice. */
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

/** Every screen or tile change scrolls the panel under the header and focuses the new heading; never the page top. */
function useRevealOnChange(
  intake: IntakeController,
  panel: React.RefObject<HTMLDivElement | null>,
) {
  const { navigated } = intake;
  const { step, startTile } = intake.state;
  useEffect(() => {
    if (!navigated) return;
    revealPanel(panel.current, document.getElementById(STEP_HEADING_ID));
  }, [navigated, step, startTile, panel]);
}

interface IntakeFlowProps {
  /** The page's h1, rendered inside the panel so it is in the static HTML. */
  heading: React.ReactNode;
}

/** The "Request a consult" flow: one screen per step with progress and autosave; an API check runs alongside. */
export function IntakeFlow({ heading }: IntakeFlowProps) {
  const intake = useIntake();
  const status = useApiStatus();
  const resume = useResume(intake);
  const panelRef = useRef<HTMLDivElement>(null);
  useRevealOnChange(intake, panelRef);
  const { addFile, patchAnswers, removeFile } = intake;

  const onUploaded = useCallback(
    (file: IntakeFile) => {
      addFile(file);
      if (file.slot === VOICE_NOTE_SLOT) patchAnswers({ voiceNoteFileId: file.id });
    },
    [addFile, patchAnswers],
  );
  const uploads = useUploads(intake.state.session, intake.state.files, onUploaded, removeFile);

  const { state } = intake;
  const Step = STEPS[state.step];
  const number = stepNumber(state.step, state);
  return (
    <div
      ref={panelRef}
      className="wizard intake-flow border border-line bg-white px-5 pt-5 sm:px-8 sm:pt-6"
    >
      {heading}
      {/* The first screen needs no server, so it renders at once (also in the static HTML); only an offline answer swaps in the fallback. */}
      {status === 'offline' ? (
        <Fallback />
      ) : (
        <>
          <ResumeNotice resume={resume} />
          {number !== null && (
            <div className="mt-3">
              <ProgressBar
                step={number}
                total={numberedStepCount(state)}
                timeLeft={minutesToGo(state.step, visibleSteps(state))}
              />
            </div>
          )}
          <div key={`${state.step}-${state.startTile}`} className="intake-body wizard-enter mt-5">
            <Step intake={intake} uploads={uploads} />
          </div>
        </>
      )}
    </div>
  );
}
