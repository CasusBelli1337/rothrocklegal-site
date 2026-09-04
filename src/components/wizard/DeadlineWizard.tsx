'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { todayISO } from '@/lib/deadlines/dates';
import { revealPanel } from '@/lib/reveal-panel';
import { useWizardState, type WizardController } from './use-wizard-state';
import { RESULTS_HEADING_ID, WizardResults } from './WizardResults';
import { questionHeadingId, WizardStepView } from './WizardStep';
import './wizard.css';

/** Where focus goes after a move: the results heading, or the question now on screen. */
export function wizardHeadingId(showResults: boolean, stepId: string): string {
  return showResults ? RESULTS_HEADING_ID : questionHeadingId(stepId);
}

/**
 * Every move scrolls the panel's top edge under the sticky header and focuses
 * the new heading in place. A validation message is not a move, so the visitor
 * keeps looking at the question they just answered (Arthur, 2026-09-04).
 */
function useRevealOnMove(wizard: WizardController, panel: React.RefObject<HTMLDivElement | null>) {
  const { navigated, showResults, stepIndex, step } = wizard;
  const headingId = wizardHeadingId(showResults, step.id);
  useEffect(() => {
    if (!navigated) return;
    revealPanel(panel.current, document.getElementById(headingId));
  }, [navigated, showResults, stepIndex, headingId, panel]);
}

function WizardNav({ wizard }: { wizard: WizardController }) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        onClick={wizard.back}
        disabled={wizard.stepIndex === 0}
        className="min-w-28"
      >
        Back
      </Button>
      <Button type="submit">{wizard.isLast ? 'Show my deadlines' : 'Continue'}</Button>
      {wizard.stepIndex > 0 && (
        <button
          type="button"
          onClick={wizard.startOver}
          className="tap-link ml-auto text-small text-ink-3 underline underline-offset-3 hover:text-maroon-700"
        >
          Start over
        </button>
      )}
    </div>
  );
}

function WizardForm({ wizard }: { wizard: WizardController }) {
  const { step, steps, stepIndex } = wizard;
  const progress = ((stepIndex + 1) / steps.length) * 100;
  return (
    <form
      onSubmit={wizard.next}
      noValidate
      aria-labelledby="wizard-heading"
      className="border border-line bg-white p-6 sm:p-10"
    >
      <h2 id="wizard-heading" className="sr-only">
        Deadline questions
      </h2>
      <p className="text-meta text-ink-3 tabular" aria-live="polite">
        Step {stepIndex + 1} of {steps.length}
      </p>
      <div className="wizard-progress mt-3" aria-hidden="true">
        <div className="wizard-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-8" key={step.id}>
        <WizardStepView
          step={step}
          answers={wizard.answers}
          error={wizard.error}
          onChoice={wizard.onChoice}
          onToggleConcern={wizard.onToggleConcern}
          onDate={wizard.onDate}
        />
      </div>
      <WizardNav wizard={wizard} />
    </form>
  );
}

/**
 * "How long do I have?" – one question per step, answers persisted in
 * localStorage, results computed client-side from the rule table.
 */
export function DeadlineWizard() {
  const wizard = useWizardState();
  const panelRef = useRef<HTMLDivElement>(null);
  useRevealOnMove(wizard, panelRef);
  return (
    <div ref={panelRef} className="wizard">
      {wizard.showResults ? (
        <WizardResults
          answers={wizard.answers}
          today={todayISO()}
          onEdit={wizard.editAnswers}
          onStartOver={wizard.startOver}
        />
      ) : (
        <WizardForm wizard={wizard} />
      )}
    </div>
  );
}
