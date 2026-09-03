'use client';

import { MIC_COPY } from '@/lib/intake/copy-mic';
import { showsButton } from '@/lib/intake/mic-help';
import { useBrowser } from '@/lib/intake/use-browser';
import { useMic, type MicHandlers } from '@/lib/intake/use-mic';
import { MicHelp } from './MicHelp';

function MicIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </svg>
  );
}

const IDLE_BUTTON =
  'inline-flex h-12 items-center gap-2 border border-ink px-5 text-body font-semibold text-ink transition-colors hover:bg-sand';
const STOP_BUTTON =
  'inline-flex h-14 w-full items-center justify-center gap-2 bg-maroon-700 px-8 text-lead font-semibold text-white transition-colors hover:bg-maroon-800 sm:w-auto';

function StatusLine({ phase, transcript, notice }: MicStatusProps) {
  return (
    <p className="mt-2 min-h-6 text-small text-ink-3" aria-live="polite">
      {phase === 'prompt' && MIC_COPY.prompt}
      {phase === 'asking' && MIC_COPY.asking}
      {phase === 'listening' && (
        <span className="inline-flex items-start gap-2 font-medium text-ink">
          <span
            aria-hidden="true"
            className="mt-1.5 h-3 w-3 shrink-0 animate-pulse rounded-full bg-error"
          />
          {transcript ? MIC_COPY.listening : MIC_COPY.listeningRecordOnly}
        </span>
      )}
      {notice && <span className="text-error">{notice}</span>}
    </p>
  );
}

interface MicStatusProps {
  phase: ReturnType<typeof useMic>['phase'];
  transcript: boolean;
  notice: string | null;
}

/**
 * Microphone control for the story step. Never renders nothing: when the
 * browser cannot record, has no microphone, or has blocked it, `MicHelp`
 * explains what to do instead. Stops on unmount.
 */
export function MicButton(handlers: MicHandlers) {
  const mic = useMic(handlers);
  const browser = useBrowser();
  const { phase, support } = mic;
  if (!showsButton(phase)) return <MicHelp mic={mic} browser={browser} />;

  const listening = phase === 'listening';
  const label = listening
    ? MIC_COPY.stop
    : phase === 'asking'
      ? 'Cancel'
      : support.transcript
        ? MIC_COPY.speak
        : MIC_COPY.record;
  return (
    <div>
      <button
        type="button"
        aria-pressed={listening}
        onClick={mic.press}
        className={listening ? STOP_BUTTON : IDLE_BUTTON}
      >
        <MicIcon className={listening ? 'h-6 w-6' : 'h-5 w-5'} />
        {label}
      </button>
      <StatusLine phase={phase} transcript={support.transcript} notice={mic.notice} />
    </div>
  );
}
