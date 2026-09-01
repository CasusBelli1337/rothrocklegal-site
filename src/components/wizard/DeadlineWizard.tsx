'use client';

import { todayISO } from '@/lib/deadlines/dates';
import { useWizardState, type WizardController } from './use-wizard-state';
import { WizardResults } from './WizardResults';
import { WizardStepView } from './WizardStep';
import './wizard.css';

function WizardNav({ wizard }: { wizard: WizardController }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={wizard.back}
        disabled={wizard.stepIndex === 0}
        className="wizard-btn wizard-btn-secondary"
      >
        Back
      </button>
      <button type="submit" className="btn-primary wizard-btn">
        {wizard.isLast ? 'Show my deadlines' : 'Continue'}
      </button>
      {wizard.stepIndex > 0 && (
        <button
          type="button"
          onClick={wizard.startOver}
          className="wizard-link ml-auto text-sm text-navy-light underline"
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
      className="border border-gold p-6 sm:p-10"
    >
      <h2 id="wizard-heading" className="sr-only">
        Deadline questions
      </h2>
      <p className="eyebrow" aria-live="polite">
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
          focusOnMount={wizard.navigated}
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
  return (
    <div className="wizard">
      {wizard.showResults ? (
        <WizardResults
          answers={wizard.answers}
          today={todayISO()}
          focusOnMount={wizard.navigated}
          onEdit={wizard.editAnswers}
          onStartOver={wizard.startOver}
        />
      ) : (
        <WizardForm wizard={wizard} />
      )}
    </div>
  );
}
