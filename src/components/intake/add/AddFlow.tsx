'use client';

import { useCallback, useEffect, useRef, type ComponentType } from 'react';
import { ADDITION_FILES } from '@/lib/intake/api-add';
import type { AddPhase } from '@/lib/intake/add-state';
import type { IntakeFile } from '@/lib/intake/contract';
import { useAddition, type AdditionController } from '@/lib/intake/use-addition';
import { useUploads, type UploadBinding } from '@/lib/intake/use-uploads';
import { revealPanel } from '@/lib/reveal-panel';
import '@/components/wizard/wizard.css';
import '../intake.css';
import { AddAsk } from './AddAsk';
import { AddClosed } from './AddClosed';
import { AddDone } from './AddDone';
import { ADD_HEADING_ID } from './AddFrame';
import { AddOpen } from './AddOpen';
import { AddWait } from './AddWait';

interface ScreenProps {
  add: AdditionController;
  uploads: UploadBinding;
}

/** One screen per phase (config over code); the email screen covers both the form and its card. */
const SCREENS: Record<AddPhase, ComponentType<ScreenProps>> = {
  ask: AddAsk,
  asked: AddAsk,
  opening: AddWait,
  restoring: AddWait,
  open: AddOpen,
  closed: AddClosed,
  limit: AddClosed,
  done: AddDone,
};

/** Every screen change after the first scrolls the panel under the header and focuses its heading. */
function useRevealOnPhase(phase: AddPhase, panel: React.RefObject<HTMLDivElement | null>) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    revealPanel(panel.current, document.getElementById(ADD_HEADING_ID));
  }, [phase, panel]);
}

interface AddFlowProps {
  /** The page's h1, rendered inside the panel so it is in the static HTML. */
  heading: React.ReactNode;
}

/** "Add to your request": the email first, then the emailed link opens an addition to fill and send. */
export function AddFlow({ heading }: AddFlowProps) {
  const add = useAddition();
  const { state, dispatch } = add;
  const panelRef = useRef<HTMLDivElement>(null);
  useRevealOnPhase(state.phase, panelRef);
  const onUploaded = useCallback(
    (file: IntakeFile) => dispatch({ type: 'file-added', file }),
    [dispatch],
  );
  const onRemoved = useCallback(
    (fileId: string) => dispatch({ type: 'file-removed', fileId }),
    [dispatch],
  );
  const uploads = useUploads(state.addition, state.files, onUploaded, onRemoved, ADDITION_FILES);
  const Screen = SCREENS[state.phase];
  return (
    <div
      ref={panelRef}
      className="wizard intake-flow border border-line bg-white px-5 pt-5 sm:px-8 sm:pt-6"
    >
      {heading}
      <div key={state.phase} className="intake-body wizard-enter mt-5">
        <Screen add={add} uploads={uploads} />
      </div>
    </div>
  );
}
