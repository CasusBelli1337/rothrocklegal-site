import type {
  EvaluationClientView,
  FollowUpAnswer,
  FollowUpModule,
  IntakeAnswers,
  IntakeFile,
  IntakeSession,
  StoryRead,
  SubmitResponse,
} from './contract';

/** One localStorage key holds the whole flow (session token included) so a refresh restores it. */
export const STORAGE_KEY = 'rl-intake';

/**
 * One screen per step (v3: story first). `start` and `done` are not numbered;
 * `follow-up` exists only when the evaluation returned questions.
 */
export const STEP_ORDER = [
  'start',
  'contact',
  'story',
  'situations',
  'documents',
  'parties',
  'scope',
  'follow-up',
  'review',
  'done',
] as const;
export type StepId = (typeof STEP_ORDER)[number];

/** The three compact tiles of the start step, one visible at a time. */
export type StartTile = 0 | 1 | 2;
export const LAST_START_TILE: StartTile = 2;

export interface IntakeState {
  version: 2;
  session: IntakeSession | null;
  step: StepId;
  startTile: StartTile;
  /** The three boxes on the last start tile; `answers.acknowledgedDisclaimers` is true once all are ticked. */
  acks: [boolean, boolean, boolean];
  answers: IntakeAnswers;
  files: IntakeFile[];
  /** Pass 1: what the model read in the story. Null until it ran, or when it could not read it. */
  storyRead: StoryRead | null;
  /** The story the last read (or failed attempt) was made from; null when none ran. */
  storyReadFor: string | null;
  /** Pass 2: what the model read in the story and the uploads. Null until it ran, or when unavailable. */
  evaluation: EvaluationClientView | null;
  /** The story and files the last evaluation (or failed attempt) was made from; null when none ran. */
  evaluationFor: string | null;
  followUpAnswers: Record<string, FollowUpAnswer>;
  result: SubmitResponse | null;
}

export function emptyAnswers(): IntakeAnswers {
  return {
    contact: { fullName: '', email: '', replyBy: 'email' },
    situations: [],
    parties: [],
    story: '',
    acknowledgedDisclaimers: false,
  };
}

export function emptyState(): IntakeState {
  return {
    version: 2,
    session: null,
    step: 'start',
    startTile: 0,
    acks: [false, false, false],
    answers: emptyAnswers(),
    files: [],
    storyRead: null,
    storyReadFor: null,
    evaluation: null,
    evaluationFor: null,
    followUpAnswers: {},
    result: null,
  };
}

/** True when the evaluation left questions to show; otherwise the follow-up screen is skipped. */
export function hasFollowUp(state: IntakeState): boolean {
  return (state.evaluation?.modules.length ?? 0) > 0;
}

/** The screens this flow will show, in order. */
export function visibleSteps(state: IntakeState): readonly StepId[] {
  return hasFollowUp(state) ? STEP_ORDER : STEP_ORDER.filter((step) => step !== 'follow-up');
}

/** 1..N for the numbered screens (contact through review), null for start and done. */
export function stepNumber(step: StepId, state: IntakeState): number | null {
  const order = visibleSteps(state);
  const index = order.indexOf(step);
  return index >= 1 && index <= order.length - 2 ? index : null;
}

/** 8 with a follow-up screen, 7 without. */
export function numberedStepCount(state: IntakeState): number {
  return visibleSteps(state).length - 2;
}

export function nextStep(state: IntakeState): StepId {
  const order = visibleSteps(state);
  const index = order.indexOf(state.step);
  return order[Math.min(index + 1, order.length - 1)];
}

export function prevStep(state: IntakeState): StepId {
  const order = visibleSteps(state);
  const index = order.indexOf(state.step);
  return order[Math.max(index - 1, 0)];
}

/** Back is offered on every screen but the first tile and the done screen. */
export function canGoBack(state: IntakeState): boolean {
  if (state.step === 'start') return state.startTile > 0;
  return state.step !== 'done';
}

/** A partial update; the contact object may itself be partial. */
export type AnswersPatch = Omit<Partial<IntakeAnswers>, 'contact'> & {
  contact?: Partial<IntakeAnswers['contact']>;
};

/** Deep-merges `contact`; everything else replaces. */
export function mergeAnswers(base: IntakeAnswers, patch: AnswersPatch): IntakeAnswers {
  return { ...base, ...patch, contact: { ...base.contact, ...(patch.contact ?? {}) } };
}

export function isAnswered(module: FollowUpModule, answer: FollowUpAnswer | undefined): boolean {
  if (module.type === 'info') return true;
  if (answer === undefined || answer === null) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === 'boolean') return true;
  return answer.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Only version 2 restores; a v1 draft (the old step order) is dropped. */
function isIntakeState(value: unknown): value is IntakeState {
  if (!isRecord(value)) return false;
  return (
    value.version === 2 &&
    typeof value.step === 'string' &&
    (STEP_ORDER as readonly string[]).includes(value.step) &&
    isRecord(value.answers) &&
    isRecord(value.answers.contact) &&
    Array.isArray(value.acks) &&
    Array.isArray(value.files) &&
    isRecord(value.followUpAnswers)
  );
}

function storageOf(storage?: Storage): Storage | undefined {
  try {
    return storage ?? globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function loadState(storage?: Storage): IntakeState | null {
  try {
    const raw = storageOf(storage)?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isIntakeState(parsed)) return null;
    return { ...emptyState(), ...parsed, answers: mergeAnswers(emptyAnswers(), parsed.answers) };
  } catch {
    return null;
  }
}

export function saveState(state: IntakeState, storage?: Storage): void {
  try {
    storageOf(storage)?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or storage full: the flow still works for this visit.
  }
}

export function clearState(storage?: Storage): void {
  try {
    storageOf(storage)?.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
