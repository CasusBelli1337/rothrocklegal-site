'use client';

import { useState } from 'react';
import { clearLensState, recordEffect } from '@/lib/lens/store';
import type { Lens } from '@/lib/lens/types';
import { useLens } from '@/lib/lens/useLens';

/** Direct scores, the same way the escape hatch sets them (switch:trustee = +3, switch:beneficiary = -3). */
const SCORE: Record<Lens, number> = { neutral: 0, beneficiary: -3, trustee: 3 };
const LABEL: Record<Lens, string> = {
  neutral: 'Neutral',
  beneficiary: 'Beneficiary',
  trustee: 'Trustee',
};
const ORDER: readonly Lens[] = ['neutral', 'beneficiary', 'trustee'];

const button =
  'h-8 rounded-full px-2 text-small font-semibold transition-colors duration-150 sm:px-3 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/**
 * Editor-preview only (next.config.mjs sets NEXT_PUBLIC_PREVIEW_TOOLS under
 * EDITOR_PREVIEW; the root layout never imports this in production). Flips
 * the lens in place through the store, so html[data-lens] updates without a
 * reload; Reset forgets the score and the tab's landing flag.
 */
export function PreviewLensSwitch() {
  const { lens } = useLens();
  const [announcement, setAnnouncement] = useState('');

  const choose = (next: Lens) => {
    recordEffect({ key: `preview:${next}`, set: SCORE[next] });
    setAnnouncement(`Lens set to ${LABEL[next]}.`);
  };
  const reset = () => {
    clearLensState();
    setAnnouncement('Lens reset. The next page you open counts as the landing.');
  };

  return (
    <div
      role="group"
      aria-label="Preview lens"
      className="fixed bottom-[4.5rem] left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-maroon-900 p-1 text-white shadow-md sm:pl-3 lg:bottom-24"
    >
      <span className="mr-1 hidden text-eyebrow font-semibold tracking-[0.14em] text-white/70 uppercase sm:inline">
        Lens
      </span>
      {ORDER.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={lens === option}
          onClick={() => choose(option)}
          className={`${button} ${
            lens === option ? 'bg-white text-maroon-900' : 'text-white/85 hover:bg-white/10'
          }`}
        >
          {LABEL[option]}
        </button>
      ))}
      <button
        type="button"
        onClick={reset}
        className={`${button} text-white/70 underline underline-offset-3 hover:text-white`}
      >
        Reset
      </button>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
