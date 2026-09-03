import type { SpeechSupport } from './speech';

/**
 * The microphone's state machine for the story step. Pure: the hook feeds it
 * what the browser reports and renders whatever phase comes out, so the
 * screen always says something (never a missing button).
 */

export type MicPhase =
  | 'checking'
  | 'unsupported'
  | 'no-microphone'
  | 'denied'
  | 'prompt'
  | 'ready'
  | 'asking'
  | 'listening';

export type PreflightResult = Extract<
  MicPhase,
  'unsupported' | 'no-microphone' | 'denied' | 'prompt' | 'ready'
>;

export type PermissionResult = 'granted' | 'denied' | 'prompt' | 'unknown';

/** What the pre-flight can ask the browser; tests pass plain functions. */
export interface MicProbe {
  support: SpeechSupport;
  /** `navigator.mediaDevices.enumerateDevices`, when the browser has it. */
  devices?: () => Promise<{ kind: string }[]>;
  /** `navigator.permissions.query({ name: "microphone" })`; only Chromium answers. */
  permission?: () => Promise<PermissionResult>;
}

/**
 * Before permission, browsers hide labels but still list device kinds. An empty
 * list means the browser is hiding everything, not that there is no microphone.
 */
async function hasNoMicrophone(devices: MicProbe['devices']): Promise<boolean> {
  if (!devices) return false;
  try {
    const list = await devices();
    return list.length > 0 && !list.some((device) => device.kind === 'audioinput');
  } catch {
    return false;
  }
}

async function queryPermission(permission: MicProbe['permission']): Promise<PermissionResult> {
  if (!permission) return 'unknown';
  try {
    return await permission();
  } catch {
    return 'unknown';
  }
}

/** Runs when the story step mounts and again on "Try again". */
export async function preflightMic(probe: MicProbe): Promise<PreflightResult> {
  if (!probe.support.transcript && !probe.support.recording) return 'unsupported';
  if (await hasNoMicrophone(probe.devices)) return 'no-microphone';
  const permission = await queryPermission(probe.permission);
  if (permission === 'denied') return 'denied';
  if (permission === 'granted') return 'ready';
  return 'prompt';
}

export type MicFailure = 'denied' | 'no-microphone' | 'busy' | 'other';

export type MicEvent =
  | { type: 'preflight'; result: PreflightResult }
  | { type: 'press' }
  | { type: 'started' }
  | { type: 'stopped' }
  | { type: 'failed'; reason: MicFailure }
  | { type: 'retry' };

const AFTER_FAILURE: Record<MicFailure, MicPhase> = {
  denied: 'denied',
  'no-microphone': 'no-microphone',
  busy: 'ready',
  other: 'ready',
};

const CAN_PRESS: readonly MicPhase[] = ['prompt', 'ready'];
const CAN_RETRY: readonly MicPhase[] = ['denied', 'no-microphone'];

export function micReducer(phase: MicPhase, event: MicEvent): MicPhase {
  switch (event.type) {
    case 'preflight':
      return phase === 'checking' ? event.result : phase;
    case 'press':
      return CAN_PRESS.includes(phase) ? 'asking' : phase;
    case 'started':
      return phase === 'asking' ? 'listening' : phase;
    case 'stopped':
      return phase === 'listening' || phase === 'asking' ? 'ready' : phase;
    case 'failed':
      return AFTER_FAILURE[event.reason];
    case 'retry':
      return CAN_RETRY.includes(phase) ? 'checking' : phase;
  }
}

/** `getUserMedia` rejections, by the DOMException name browsers use. */
const MEDIA_ERROR_NAMES: Record<string, MicFailure> = {
  NotAllowedError: 'denied',
  PermissionDeniedError: 'denied',
  SecurityError: 'denied',
  NotFoundError: 'no-microphone',
  DevicesNotFoundError: 'no-microphone',
  OverconstrainedError: 'no-microphone',
  NotReadableError: 'busy',
  TrackStartError: 'busy',
  AbortError: 'busy',
};

export function classifyMediaError(error: unknown): MicFailure {
  const name =
    typeof error === 'object' && error !== null ? (error as { name?: unknown }).name : '';
  return typeof name === 'string' ? (MEDIA_ERROR_NAMES[name] ?? 'other') : 'other';
}

/** Web Speech API error codes (`SpeechRecognitionErrorEvent.error`). */
const SPEECH_ERROR_CODES: Record<string, MicFailure> = {
  'not-allowed': 'denied',
  'service-not-allowed': 'denied',
  'audio-capture': 'no-microphone',
};

export function classifySpeechError(code: string): MicFailure {
  return SPEECH_ERROR_CODES[code] ?? 'other';
}

/** Phases where the button itself is offered (in the others a card explains instead). */
export function showsButton(phase: MicPhase): boolean {
  return phase === 'prompt' || phase === 'ready' || phase === 'asking' || phase === 'listening';
}
