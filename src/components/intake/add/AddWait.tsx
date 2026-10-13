'use client';

import { ADD_WAIT_COPY } from '@/lib/intake/copy';
import type { AdditionController } from '@/lib/intake/use-addition';
import { AddFrame } from './AddFrame';

/** While the emailed link opens (or a refreshed page is restored); a lost connection offers a retry. */
export function AddWait({ add }: { add: AdditionController }) {
  const { state } = add;
  const line = state.phase === 'restoring' ? ADD_WAIT_COPY.restoring : ADD_WAIT_COPY.opening;
  return (
    <AddFrame title={line}>
      {state.error ? (
        <div role="alert" className="wizard-alert">
          <p className="text-body text-ink">{state.error}</p>
          <button
            type="button"
            onClick={add.retry}
            className="mt-4 inline-flex h-11 items-center border border-ink bg-white px-5 text-body font-semibold text-ink transition-colors hover:bg-sand"
          >
            {ADD_WAIT_COPY.retry}
          </button>
        </div>
      ) : (
        <div role="status" aria-live="polite" className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-maroon-700 border-t-transparent"
          />
          <p className="text-body text-ink-2">{line}</p>
        </div>
      )}
    </AddFrame>
  );
}
