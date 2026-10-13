'use client';

import { Button } from '@/components/ui/Button';

export const ADD_HEADING_ID = 'add-step-heading';
export const ADD_ERROR_ID = 'add-step-error';

interface AddBarProps {
  error: string | null;
  label: string;
  busy?: boolean;
  /** The quiet line on the left: the note's save state. */
  status?: string;
  /** "Next: ..." beside the button, from `md`. */
  next?: string;
}

/**
 * The action bar of the add page, the consult flow's look: a message above
 * the buttons (so the button never moves), a quiet status on the left, and the
 * one primary button on the right, full-width on phones.
 */
export function AddBar({ error, label, busy, status, next }: AddBarProps) {
  return (
    <div className="intake-bar -mx-5 px-5 py-3 sm:-mx-8 sm:px-8">
      {error && (
        <p
          id={ADD_ERROR_ID}
          role="alert"
          aria-live="assertive"
          className="mb-3 text-small font-semibold text-error"
        >
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {status !== undefined && (
          <span className="min-h-6 text-meta text-ink-3 sm:flex-1" aria-live="polite">
            {status}
          </span>
        )}
        <div className="flex items-center gap-4 sm:ml-auto sm:justify-end">
          {next && (
            <span className="hidden max-w-[30ch] text-meta text-ink-3 md:block">{next}</span>
          )}
          <Button type="submit" loading={busy} className="intake-continue w-full sm:w-auto">
            {label}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AddFrameProps {
  title: string;
  lead?: React.ReactNode;
  onSubmit?: () => void;
  /** Wires the message to the form for screen readers. */
  hasError?: boolean;
  /** The action bar; none on screens with nothing to submit. */
  bar?: React.ReactNode;
  children: React.ReactNode;
}

/** One screen of the add page: heading (focus lands here when the screen changes), lead, body, bar. */
export function AddFrame({ title, lead, onSubmit, hasError, bar, children }: AddFrameProps) {
  return (
    <form
      noValidate
      aria-labelledby={ADD_HEADING_ID}
      aria-describedby={hasError ? ADD_ERROR_ID : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <h2
        id={ADD_HEADING_ID}
        tabIndex={-1}
        className="font-serif text-h3 text-ink outline-none md:text-h2"
      >
        {title}
      </h2>
      {lead && <div className="mt-2 max-w-[62ch] text-body text-ink-2">{lead}</div>}
      <div className="mt-6 flex-1 pb-6">{children}</div>
      {bar}
    </form>
  );
}
