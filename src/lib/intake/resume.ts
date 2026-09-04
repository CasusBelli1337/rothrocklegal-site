import type { IntakeStatus, ResumeResponse } from './contract';
import { evaluationKey, storyKey } from './readings';
import {
  emptyAnswers,
  emptyState,
  mergeAnswers,
  visibleSteps,
  type IntakeState,
  type StepId,
} from './state';
import { validateStep } from './validate';

/**
 * "Continue by email": the pure parts. The emailed link carries a token; the
 * server exchanges it for the earlier request, and these functions decide
 * which screen to land on and how the "started before" card behaves.
 */

export const RESUME_PARAM = 'resume';

/** The token from `?resume=<token>`, or null when the URL carries none. */
export function readResumeToken(search: string): string | null {
  const token = new URLSearchParams(search).get(RESUME_PARAM)?.trim();
  return token ? token : null;
}

/** The numbered screens a draft can land on (follow-up only when the evaluation left questions). */
function resumableSteps(state: IntakeState): readonly StepId[] {
  return visibleSteps(state).filter((step) => step !== 'start' && step !== 'done');
}

/** The first numbered screen whose required answers are missing; review when nothing is. */
export function firstIncompleteStep(state: IntakeState): StepId {
  return resumableSteps(state).find((step) => validateStep(step, state) !== null) ?? 'review';
}

const FINISHED: readonly IntakeStatus[] = ['submitted', 'conflict-hold', 'declined', 'reviewed'];

/**
 * Where a resumed request opens. Anything already sent opens on the done
 * screen; a request still in progress opens on the earlier of the screen the
 * server remembers and the first screen with a missing answer, so nothing
 * required is skipped. The model passes re-run on their own screens if needed.
 */
export function resumeStep(status: IntakeStatus, state: IntakeState, serverStep?: string): StepId {
  if (FINISHED.includes(status)) return 'done';
  const steps = resumableSteps(state);
  const incomplete = firstIncompleteStep(state);
  const remembered = steps.find((step) => step === serverStep);
  if (!remembered) return incomplete;
  return steps.indexOf(remembered) < steps.indexOf(incomplete) ? remembered : incomplete;
}

/** The whole flow state from the server's answer; the person already ticked the three boxes once. */
export function stateFromResume(response: ResumeResponse): IntakeState {
  const answers = mergeAnswers(emptyAnswers(), response.answers ?? {});
  const draft: IntakeState = {
    ...emptyState(),
    session: response.session,
    startTile: 2,
    acks: [true, true, true],
    answers: { ...answers, acknowledgedDisclaimers: true },
    files: Array.isArray(response.files) ? response.files : [],
    storyRead: response.storyRead ?? null,
    evaluation: response.evaluation ?? null,
  };
  const keyed: IntakeState = {
    ...draft,
    storyReadFor: draft.storyRead ? storyKey(draft) : null,
    evaluationFor: draft.evaluation ? evaluationKey(draft) : null,
  };
  return { ...keyed, step: resumeStep(response.session.status, keyed, response.step) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Enough of the shape to restore safely; anything else is treated as an expired link. */
export function isResumeResponse(value: unknown): value is ResumeResponse {
  if (!isRecord(value) || !isRecord(value.session) || !isRecord(value.answers)) return false;
  const { id, token, status, reference } = value.session;
  return (
    typeof id === 'string' &&
    typeof token === 'string' &&
    typeof status === 'string' &&
    typeof reference === 'string'
  );
}

/* ---- The "started before" card on the contact step ---------------------- */

/** `answered` covers both outcomes on purpose: the page shows one card whatever the server said. */
export type LookupPhase = 'idle' | 'checking' | 'answered' | 'dismissed';

/** `email` is the address the phase is about; a different address starts over. */
export interface LookupState {
  phase: LookupPhase;
  email: string;
}

export type LookupEvent =
  | { type: 'check'; email: string }
  | { type: 'result'; email: string; found: boolean }
  | { type: 'dismiss' };

export const LOOKUP_IDLE: LookupState = { phase: 'idle', email: '' };

export function lookupReducer(state: LookupState, event: LookupEvent): LookupState {
  switch (event.type) {
    case 'check':
      if (state.email === event.email && state.phase !== 'idle') return state;
      return { phase: 'checking', email: event.email };
    case 'result':
      if (state.phase !== 'checking' || state.email !== event.email) return state;
      return { phase: 'answered', email: event.email };
    case 'dismiss':
      return state.phase === 'answered' ? { ...state, phase: 'dismissed' } : state;
  }
}

/** Lower-cased and trimmed, so "Jane@Example.com " and "jane@example.com" are one lookup. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
