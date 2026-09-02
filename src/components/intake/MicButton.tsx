'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createTranscriber,
  detectSpeechSupport,
  startRecording,
  type Recorder,
  type SpeechSupport,
  type Transcriber,
} from '@/lib/intake/speech';

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

interface MicButtonProps {
  onInterim(text: string): void;
  onFinal(text: string): void;
  /** Recorded audio to upload as the `voice-note` slot. */
  onVoiceNote(file: File): void;
}

const NONE: SpeechSupport = { transcript: false, recording: false };

/**
 * Microphone control for the story step. Live transcription when the browser
 * has the Web Speech API, audio capture when it has MediaRecorder, both when
 * it has both. Renders nothing when it has neither. Stops on unmount.
 */
export function MicButton({ onInterim, onFinal, onVoiceNote }: MicButtonProps) {
  const [support, setSupport] = useState<SpeechSupport>(NONE);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriber = useRef<Transcriber | null>(null);
  const recorder = useRef<Recorder | null>(null);

  useEffect(() => setSupport(detectSpeechSupport()), []);

  const stop = useCallback(async () => {
    transcriber.current?.stop();
    transcriber.current = null;
    const active = recorder.current;
    recorder.current = null;
    setListening(false);
    onInterim('');
    const file = await active?.stop();
    if (file) onVoiceNote(file);
  }, [onInterim, onVoiceNote]);

  useEffect(
    () => () => {
      transcriber.current?.stop();
      void recorder.current?.stop();
    },
    [],
  );

  const start = useCallback(async () => {
    setError(null);
    if (support.recording) {
      try {
        recorder.current = await startRecording();
      } catch {
        setError('The browser blocked the microphone. Allow it in the address bar and try again.');
        return;
      }
    }
    if (support.transcript) {
      transcriber.current = createTranscriber({
        onInterim,
        onFinal,
        onError: (message) => {
          setError(message);
          void stop();
        },
        onStop: () => setListening(false),
      });
      transcriber.current?.start();
    }
    setListening(true);
  }, [support, onInterim, onFinal, stop]);

  if (!support.transcript && !support.recording) return null;

  const idleLabel = support.transcript ? 'Speak instead of typing' : 'Record a voice note';
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-pressed={listening}
        onClick={() => void (listening ? stop() : start())}
        className={`inline-flex h-11 items-center gap-2 rounded-md border px-4 text-[15px] font-semibold transition-colors ${
          listening
            ? 'border-maroon-700 bg-maroon-50 text-maroon-700'
            : 'border-ink text-ink hover:bg-sand'
        }`}
      >
        <MicIcon />
        {listening ? 'Stop' : idleLabel}
      </button>
      <span className="text-small text-ink-3" aria-live="polite">
        {listening && (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse rounded-full bg-error" />
            Listening…{' '}
            {support.transcript
              ? 'your words appear below as we hear them.'
              : 'we will listen to the recording.'}
          </span>
        )}
        {error && <span className="text-error">{error}</span>}
      </span>
    </div>
  );
}
