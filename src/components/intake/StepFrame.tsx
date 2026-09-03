'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { STEP_TITLES } from '@/lib/intake/copy';
import { canGoBack } from '@/lib/intake/state';
import type { IntakeController, SaveStatus } from '@/lib/intake/use-intake';

export const STEP_HEADING_ID = 'intake-step-heading';
export const STEP_ERROR_ID = 'intake-step-error';

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Could not save. We will try again when you continue.',
};

interface StepNavProps {
  intake: IntakeController;
  continueLabel?: string;
  busy?: boolean;
}

/** Back (secondary) / Continue (primary) / Start over, with the autosave state. */
export function StepNav({ intake, continueLabel = 'Continue', busy }: StepNavProps) {
  const { state } = intake;
  const startOver = () => {
    if (window.confirm('Start over? This clears everything you entered.')) intake.startOver();
  };
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {canGoBack(state.step) && (
        <Button variant="secondary" onClick={intake.back} className="min-w-28">
          Back
        </Button>
      )}
      <Button type="submit" loading={busy ?? intake.busy}>
        {continueLabel}
      </Button>
      <span className="text-meta text-ink-3" aria-live="polite">
        {state.session ? SAVE_LABELS[intake.saveStatus] : ''}
      </span>
      {state.step !== 'start' && (
        <button
          type="button"
          onClick={startOver}
          className="tap-link ml-auto text-small text-ink-3 underline underline-offset-3 hover:text-maroon-700"
        >
          Start over
        </button>
      )}
    </div>
  );
}

interface StepFrameProps {
  intake: IntakeController;
  title?: string;
  lead?: React.ReactNode;
  /** Defaults to `intake.next()`. */
  onSubmit?: () => void;
  /** Defaults to the standard StepNav; pass null for none. */
  footer?: React.ReactNode | null;
  children: React.ReactNode;
}

/**
 * One screen: heading (focus lands here on step change), lead, body, the
 * error line, and the navigation. The whole screen is a form so Enter submits.
 */
export function StepFrame({ intake, title, lead, onSubmit, footer, children }: StepFrameProps) {
  const { step } = intake.state;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const copy = STEP_TITLES[step];

  useEffect(() => {
    if (intake.navigated) headingRef.current?.focus();
  }, [intake.navigated, step]);

  return (
    <form
      noValidate
      aria-labelledby={STEP_HEADING_ID}
      aria-describedby={intake.error ? STEP_ERROR_ID : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        void (onSubmit ?? intake.next)();
      }}
      className="wizard-enter"
    >
      <h2
        id={STEP_HEADING_ID}
        ref={headingRef}
        tabIndex={-1}
        className="font-serif text-h3 text-ink outline-none md:text-h2"
      >
        {title ?? copy.title}
      </h2>
      {(lead ?? copy.lead) && (
        <p className="mt-3 max-w-[60ch] text-body text-ink-2">{lead ?? copy.lead}</p>
      )}
      <div className="mt-8">{children}</div>
      <p
        id={STEP_ERROR_ID}
        role="alert"
        aria-live="assertive"
        className="mt-6 min-h-6 text-small font-semibold text-error"
      >
        {intake.error}
      </p>
      {footer === undefined ? <StepNav intake={intake} /> : footer}
    </form>
  );
}
