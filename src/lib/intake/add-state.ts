import { ApiError, errorMessage } from './api-core';
import {
  ADDITION_RULES,
  ADDITION_TOKEN_PARAM,
  type AdditionSession,
  type AdditionState,
  type IntakeFile,
} from './contract';
import { ADD_CLOSED_COPY, ADD_OPEN_COPY, UPLOAD_COPY } from './copy';
import { expiryDate } from './package';

/**
 * "Add to your request" (/request-a-consult/add/): the page's own small state
 * machine, pure so every rule is tested without a browser. The consult flow's
 * reducer (state.ts) is never involved; an addition only appends to a sent
 * request and never sees its answers.
 */
export type AddPhase =
  'ask' | 'asked' | 'opening' | 'restoring' | 'open' | 'closed' | 'limit' | 'done';

export interface AddResult {
  reference: string;
  files: number;
  withNote: boolean;
}

export interface AddState {
  phase: AddPhase;
  /** The emailed link had expired or was used: a line above the email form says so. */
  expired: boolean;
  addition: AdditionSession | null;
  note: string;
  files: IntakeFile[];
  /** A problem to show on the current screen (validation, a failed call, the server's limit message). */
  error: string | null;
  busy: boolean;
  result: AddResult | null;
}

export type AddAction =
  | { type: 'asking' }
  | { type: 'asked' }
  | { type: 'ask-again' }
  | { type: 'opening' }
  | { type: 'restoring' }
  | { type: 'opened'; addition: AdditionSession; state?: AdditionState }
  | { type: 'expired' }
  | { type: 'closed' }
  | { type: 'limit'; message: string }
  | { type: 'failed'; message: string }
  | { type: 'note'; note: string }
  | { type: 'file-added'; file: IntakeFile }
  | { type: 'file-removed'; fileId: string }
  | { type: 'error'; message: string | null }
  | { type: 'sending' }
  | { type: 'reloaded'; state: AdditionState; message: string; keepNote?: boolean }
  | { type: 'sent'; result: AddResult };

export const ADD_IDLE: AddState = {
  phase: 'ask',
  expired: false,
  addition: null,
  note: '',
  files: [],
  error: null,
  busy: false,
  result: null,
};

const opened = (state: AddState, addition: AdditionSession, server?: AdditionState): AddState => ({
  ...ADD_IDLE,
  phase: 'open',
  addition,
  note: server?.note ?? state.note,
  files: server?.files ?? [],
});

/** One handler per action (config over code); anything unknown leaves the state alone. */
const HANDLERS: {
  [K in AddAction['type']]: (s: AddState, a: Extract<AddAction, { type: K }>) => AddState;
} = {
  asking: (s) => ({ ...s, busy: true, error: null }),
  asked: (s) => ({ ...s, phase: 'asked', busy: false, error: null, expired: false }),
  'ask-again': () => ADD_IDLE,
  opening: (s) => ({ ...s, phase: 'opening', busy: true, error: null }),
  restoring: (s) => ({ ...s, phase: 'restoring', busy: true, error: null }),
  opened: (s, a) => opened(s, a.addition, a.state),
  expired: () => ({ ...ADD_IDLE, expired: true }),
  closed: () => ({ ...ADD_IDLE, phase: 'closed' }),
  limit: (_s, a) => ({
    ...ADD_IDLE,
    phase: 'limit',
    error: a.message || ADD_CLOSED_COPY.limitFallback,
  }),
  failed: (s, a) => ({ ...s, busy: false, error: a.message }),
  note: (s, a) => ({ ...s, note: a.note.slice(0, ADDITION_RULES.maxNoteChars), error: null }),
  'file-added': (s, a) =>
    s.files.some((f) => f.id === a.file.id)
      ? s
      : { ...s, files: [...s.files, a.file], error: null },
  'file-removed': (s, a) => ({ ...s, files: s.files.filter((f) => f.id !== a.fileId) }),
  error: (s, a) => ({ ...s, error: a.message }),
  sending: (s) => ({ ...s, busy: true, error: null }),
  reloaded: (s, a) => ({
    ...s,
    busy: false,
    note: a.keepNote ? s.note : a.state.note,
    files: a.state.files,
    error: a.message,
  }),
  sent: (_s, a) => ({ ...ADD_IDLE, phase: 'done', result: a.result }),
};

export function addReducer(state: AddState, action: AddAction): AddState {
  const handler = HANDLERS[action.type] as (s: AddState, a: AddAction) => AddState;
  return handler(state, action);
}

/** The token from `?t=<token>`, or null. */
export function readAdditionToken(search: string): string | null {
  const token = new URLSearchParams(search).get(ADDITION_TOKEN_PARAM)?.trim();
  return token ? token : null;
}

/** Send is allowed with a note or at least one file, once nothing is still uploading. */
export function sendProblem(state: AddState, uploading: number): string | null {
  if (uploading > 0) return UPLOAD_COPY.wait;
  if (!state.note.trim() && state.files.length === 0) return ADD_OPEN_COPY.needSomething;
  return null;
}

/** How a failed open answers: 401 spent or expired, 400 closed, 429 the limit, anything else a retry. */
export function openFailure(error: unknown): AddAction {
  if (error instanceof ApiError) {
    if (error.status === 401) return { type: 'expired' };
    if (error.status === 400) return { type: 'closed' };
    if (error.status === 429) return { type: 'limit', message: error.message };
    return { type: 'failed', message: error.message };
  }
  return { type: 'failed', message: errorMessage(error) };
}

/** "October 13, 2026": the day the request was sent, in the firm's calendar. */
export const FIRM_TIME_ZONE = 'America/Los_Angeles';
export function sentOnDate(iso: string, timeZone: string = FIRM_TIME_ZONE): string | null {
  return expiryDate(iso, timeZone);
}

/* ---- What survives a refresh (sessionStorage; the hook guards every access) ---- */

export const ADD_STORAGE_KEY = 'rl-intake-add';

export type StoredAdd = { v: 1; addition: AdditionSession } | { v: 1; done: AddResult };

const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

function isSession(value: unknown): value is AdditionSession {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return [s.id, s.token, s.reference, s.sentAt, s.expiresAt].every(isString);
}

function isResult(value: unknown): value is AddResult {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return isString(r.reference) && typeof r.files === 'number' && typeof r.withNote === 'boolean';
}

/** A stored addition past its `expiresAt` is dropped: its bearer no longer works. */
export function parseStoredAdd(raw: string | null, now: number = Date.now()): StoredAdd | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object' || (value as { v?: unknown }).v !== 1) return null;
  const v = value as { addition?: unknown; done?: unknown };
  if (isResult(v.done)) return { v: 1, done: v.done };
  if (!isSession(v.addition)) return null;
  const expires = Date.parse(v.addition.expiresAt);
  return Number.isNaN(expires) || expires <= now ? null : { v: 1, addition: v.addition };
}
