/**
 * Browser speech helpers for the story step: live transcription over the Web
 * Speech API and an audio capture over MediaRecorder. Both are feature-detected;
 * the UI hides the microphone when neither exists.
 */

/* Minimal shapes of the (non-standard) Web Speech API; TypeScript's DOM lib omits them. */
interface SpeechAlternativeLike {
  transcript: string;
}
interface SpeechResultLike {
  isFinal: boolean;
  0: SpeechAlternativeLike;
}
interface SpeechEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechResultLike>;
}
export interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
export type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

/** Anything window-like; tests pass a plain object. */
export type WindowLike = Record<string, unknown>;

function currentWindow(): WindowLike | undefined {
  return typeof window === 'undefined' ? undefined : (window as unknown as WindowLike);
}

export function speechRecognitionCtor(
  w: WindowLike | undefined = currentWindow(),
): SpeechRecognitionCtor | null {
  if (!w) return null;
  const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return typeof ctor === 'function' ? (ctor as SpeechRecognitionCtor) : null;
}

export function recordingSupported(w: WindowLike | undefined = currentWindow()): boolean {
  if (!w) return false;
  const nav = w.navigator as { mediaDevices?: { getUserMedia?: unknown } } | undefined;
  return (
    typeof w.MediaRecorder === 'function' && typeof nav?.mediaDevices?.getUserMedia === 'function'
  );
}

export interface SpeechSupport {
  transcript: boolean;
  recording: boolean;
}

export function detectSpeechSupport(w: WindowLike | undefined = currentWindow()): SpeechSupport {
  return { transcript: speechRecognitionCtor(w) !== null, recording: recordingSupported(w) };
}

export interface TranscriberHandlers {
  /** Text still being recognized (replaces the previous interim text). */
  onInterim(text: string): void;
  /** A finished phrase to append to the story. */
  onFinal(text: string): void;
  onError(message: string): void;
  /** Fires once the transcriber stops for good. */
  onStop(): void;
}

export interface Transcriber {
  start(): void;
  stop(): void;
}

const SPEECH_ERRORS: Record<string, string> = {
  'not-allowed': 'The browser blocked the microphone. Allow it in the address bar and try again.',
  'audio-capture': 'We could not find a microphone.',
  network: 'Speech recognition needs an internet connection.',
};

/**
 * Continuous, interim-result transcription. Browsers end a session after a
 * pause, so it restarts itself until `stop()` is called.
 */
export function createTranscriber(
  handlers: TranscriberHandlers,
  w: WindowLike | undefined = currentWindow(),
): Transcriber | null {
  const Ctor = speechRecognitionCtor(w);
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  let active = false;

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const text = result[0].transcript.trim();
      if (!text) continue;
      if (result.isFinal) handlers.onFinal(text);
      else interim += `${text} `;
    }
    handlers.onInterim(interim.trim());
  };
  recognition.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    active = false;
    handlers.onError(
      SPEECH_ERRORS[event.error] ?? 'Speech recognition stopped. You can keep typing.',
    );
  };
  recognition.onend = () => {
    if (active) {
      try {
        recognition.start();
        return;
      } catch {
        active = false;
      }
    }
    handlers.onInterim('');
    handlers.onStop();
  };

  return {
    start() {
      if (active) return;
      active = true;
      try {
        recognition.start();
      } catch {
        active = false;
        handlers.onError('We could not start the microphone.');
      }
    },
    stop() {
      active = false;
      recognition.stop();
    },
  };
}

export interface Recorder {
  /** Stops capture and resolves the audio as `voice-note.webm` (null when nothing was captured). */
  stop(): Promise<File | null>;
}

export const VOICE_NOTE_NAME = 'voice-note.webm';

function pickMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm'];
  const supported = (MediaRecorder as { isTypeSupported?: (t: string) => boolean }).isTypeSupported;
  return candidates.find((type) => supported?.(type)) ?? '';
}

/** Asks for the microphone and starts recording. Rejects if the visitor declines. */
export async function startRecording(): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  recorder.start(1000);
  return {
    stop: () =>
      new Promise<File | null>((resolve) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          if (chunks.length === 0) return resolve(null);
          resolve(new File(chunks, VOICE_NOTE_NAME, { type: recorder.mimeType || 'audio/webm' }));
        };
        recorder.stop();
      }),
  };
}
