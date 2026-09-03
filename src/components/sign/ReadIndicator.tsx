'use client';

import { CheckIcon } from '@/components/icons';
import { SIGN_COPY } from '@/lib/public/copy';

interface ReadIndicatorProps {
  seen: number;
  total: number;
  readToEnd: boolean;
  onConfirm(): void;
}

/** "Read to the end": where the person is in the agreement, and the button that says they finished. */
export function ReadIndicator({ seen, total, readToEnd, onConfirm }: ReadIndicatorProps) {
  const copy = SIGN_COPY.read;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`${readToEnd ? 'wizard-result status-open' : 'wizard-banner'} mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="flex items-start gap-3">
        {readToEnd && <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-success" />}
        <div>
          <p className="eyebrow">{copy.heading}</p>
          <p className="mt-1 text-body text-ink">
            {readToEnd
              ? copy.done
              : total > 0
                ? copy.progress(Math.max(seen, 1), total)
                : copy.hint}
          </p>
          {!readToEnd && total > 0 && <p className="mt-1 text-small text-ink-3">{copy.hint}</p>}
        </div>
      </div>
      {!readToEnd && (
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex h-12 shrink-0 items-center justify-center border border-ink bg-white px-5 text-body font-semibold text-ink transition-colors hover:bg-sand"
        >
          {copy.confirm}
        </button>
      )}
    </div>
  );
}
