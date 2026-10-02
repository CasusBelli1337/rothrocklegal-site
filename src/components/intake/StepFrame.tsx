'use client';

import { Button } from '@/components/ui/Button';
import { START_OVER_CONFIRM, STEP_TITLES, nextUpLine } from '@/lib/intake/copy';
import { LAST_START_TILE, canGoBack } from '@/lib/intake/state';
import type { IntakeController, SaveStatus } from '@/lib/intake/use-intake';

export const STEP_HEADING_ID = 'intake-step-heading';
export const STEP_ERROR_ID = 'intake-step-error';

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Could not save. We will try again when you continue.',
};

const textButton =
  'tap-link text-body font-medium text-ink underline underline-offset-3 hover:text-maroon-700';
const quietButton =
  'tap-link text-small text-ink-3 underline underline-offset-3 hover:text-maroon-700';

/** Start over and Start a new request ask first: one tap must never clear a whole request. */
export function confirmStartOver(intake: IntakeController): void {
  if (window.confirm(START_OVER_CONFIRM)) intake.startOver();
}

interface StepNavProps {
  intake: IntakeController;
  continueLabel?: string;
  busy?: boolean;
}

/**
 * The action bar, stuck to the bottom of the panel on every screen: Back and
 * Start over on the left, the autosave state, and the primary button on the
 * right with its "Next:" line (from `md`; full-width on phones). A validation
 * message appears above the buttons, so the button itself never moves. The
 * left row renders only when it has something in it: on the first tile it was
 * an empty 44px band (plus its gap) stuck over the tile text on a phone.
 */
export function StepNav({ intake, continueLabel = 'Continue', busy }: StepNavProps) {
  const { state } = intake;
  const firstTiles = state.step === 'start' && state.startTile < LAST_START_TILE;
  const next = firstTiles ? '' : nextUpLine(state);
  const back = canGoBack(state);
  const startOver = state.step !== 'start';
  const saveLabel = state.session ? SAVE_LABELS[intake.saveStatus] : '';
  return (
    <div className="intake-bar -mx-5 px-5 py-3 sm:-mx-8 sm:px-8">
      {intake.error && (
        <p
          id={STEP_ERROR_ID}
          role="alert"
          aria-live="assertive"
          className="mb-3 text-small font-semibold text-error"
        >
          {intake.error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {(back || startOver || saveLabel) && (
          <div className="flex min-h-11 flex-wrap items-center gap-x-5 gap-y-1 sm:flex-1">
            {back && (
              <button type="button" onClick={intake.back} className={textButton}>
                Back
              </button>
            )}
            {startOver && (
              <button
                type="button"
                onClick={() => confirmStartOver(intake)}
                className={quietButton}
              >
                Start over
              </button>
            )}
            <span className="text-meta text-ink-3" aria-live="polite">
              {saveLabel}
            </span>
          </div>
        )}
        <div className="flex items-center gap-4 sm:ml-auto sm:justify-end">
          {next && (
            <span className="hidden max-w-[30ch] text-meta text-ink-3 md:block">{next}</span>
          )}
          <Button
            type="submit"
            loading={busy ?? intake.busy}
            className="intake-continue w-full sm:w-auto"
          >
            {continueLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface StepFrameProps {
  intake: IntakeController;
  title?: string;
  /** Pass null for no lead at all (the default is the step's copy). */
  lead?: React.ReactNode;
  /** Defaults to `intake.next()`. */
  onSubmit?: () => void;
  /** Defaults to the standard StepNav; pass null for none. */
  footer?: React.ReactNode | null;
  children: React.ReactNode;
}

/**
 * One screen: heading (focus lands here on step change, see IntakeFlow), lead,
 * body, and the action bar. The whole screen is a form so Enter submits.
 */
export function StepFrame({ intake, title, lead, onSubmit, footer, children }: StepFrameProps) {
  const copy = STEP_TITLES[intake.state.step];
  const leadText = lead === undefined ? copy.lead : lead;
  return (
    <form
      noValidate
      aria-labelledby={STEP_HEADING_ID}
      aria-describedby={intake.error ? STEP_ERROR_ID : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        void (onSubmit ?? intake.next)();
      }}
    >
      <h2
        id={STEP_HEADING_ID}
        tabIndex={-1}
        className="font-serif text-h3 text-ink outline-none md:text-h2"
      >
        {title ?? copy.title}
      </h2>
      {leadText && <p className="mt-2 max-w-[62ch] text-body text-ink-2">{leadText}</p>}
      <div className="mt-6 flex-1 pb-6">{children}</div>
      {footer === undefined ? <StepNav intake={intake} /> : footer}
    </form>
  );
}
