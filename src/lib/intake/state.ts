import type {
  EvaluationClientView,
  FollowUpAnswer,
  FollowUpModule,
  IntakeAnswers,
  IntakeFile,
  IntakeSession,
  SubmitResponse,
} from './contract';

/** One localStorage key holds the whole flow (session token included) so a refresh restores it. */
export const STORAGE_KEY = 'rl-intake';

/** One screen per step (INTAKE-SPEC §2). `start` and `done` are not numbered. */
export const STEP_ORDER = [
  'start',
  'contact',
  'situations',
  'parties',
  'story',
  'documents',
  'scope',
  'review',
  'follow-up',
  'done',
] as const;
export type StepId = (typeof STEP_ORDER)[number];
export const NUMBERED_STEP_COUNT = 8;

export type KeyDateKey = keyof IntakeAnswers['keyDates'];

export interface IntakeState {
  version: 1;
  session: IntakeSession | null;
  step: StepId;
  /** The three start-screen boxes; `answers.acknowledgedDisclaimers` is true once all are ticked. */
  acks: [boolean, boolean, boolean];
  answers: IntakeAnswers;
  /** Key dates the client marked "not sure". */
  unsureDates: KeyDateKey[];
  files: IntakeFile[];
  evaluation: EvaluationClientView | null;
  followUpAnswers: Record<string, FollowUpAnswer>;
  result: SubmitResponse | null;
}

export function emptyAnswers(): IntakeAnswers {
  return {
    contact: { fullName: '', email: '', replyBy: 'email' },
    situations: [],
    parties: [],
    story: '',
    keyDates: {},
    missingDocuments: [],
    acknowledgedDisclaimers: false,
  };
}

export function emptyState(): IntakeState {
  return {
    version: 1,
    session: null,
    step: 'start',
    acks: [false, false, false],
    answers: emptyAnswers(),
    unsureDates: [],
    files: [],
    evaluation: null,
    followUpAnswers: {},
    result: null,
  };
}

/** 1..8 for the numbered screens, null for start and done. */
export function stepNumber(step: StepId): number | null {
  const index = STEP_ORDER.indexOf(step);
  return index >= 1 && index <= NUMBERED_STEP_COUNT ? index : null;
}

export function nextStep(step: StepId): StepId {
  const index = STEP_ORDER.indexOf(step);
  return STEP_ORDER[Math.min(index + 1, STEP_ORDER.length - 1)];
}

export function prevStep(step: StepId): StepId {
  const index = STEP_ORDER.indexOf(step);
  return STEP_ORDER[Math.max(index - 1, 0)];
}

/** Back is offered on the numbered screens before the evaluation; after it the answers are sent. */
export function canGoBack(step: StepId): boolean {
  return stepNumber(step) !== null && step !== 'follow-up';
}

/** A partial update; the nested objects may themselves be partial. */
export type AnswersPatch = Omit<Partial<IntakeAnswers>, 'contact' | 'keyDates'> & {
  contact?: Partial<IntakeAnswers['contact']>;
  keyDates?: Partial<IntakeAnswers['keyDates']>;
};

/** Deep-merges the nested objects (contact, keyDates); everything else replaces. */
export function mergeAnswers(base: IntakeAnswers, patch: AnswersPatch): IntakeAnswers {
  return {
    ...base,
    ...patch,
    contact: { ...base.contact, ...(patch.contact ?? {}) },
    keyDates: { ...base.keyDates, ...(patch.keyDates ?? {}) },
  };
}

export function isAnswered(module: FollowUpModule, answer: FollowUpAnswer | undefined): boolean {
  if (module.type === 'info') return true;
  if (answer === undefined || answer === null) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === 'boolean') return true;
  return answer.trim().length > 0;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Validator = (state: IntakeState) => string | null;

/** Plain-English problems, one per step; null means the step may advance. */
const VALIDATORS: Partial<Record<StepId, Validator>> = {
  start: (s) => (s.acks.every(Boolean) ? null : 'Please tick all three boxes to continue.'),
  contact: (s) => {
    if (!s.answers.contact.fullName.trim()) return 'Please enter your name.';
    if (!EMAIL.test(s.answers.contact.email.trim()))
      return 'Please enter an email address we can reply to.';
    return null;
  },
  situations: (s) =>
    s.answers.situations.length > 0 ? null : 'Pick at least one. "Something else" is fine.',
  parties: (s) =>
    s.answers.parties.some((p) => p.name.trim())
      ? null
      : 'Add at least one name, even if it is only the person who died.',
  story: (s) =>
    s.answers.story.trim()
      ? null
      : 'Tell us what happened, even briefly. A few sentences is enough.',
  'follow-up': (s) => {
    const modules = s.evaluation?.modules ?? [];
    const missing = modules.some(
      (m) => m.type !== 'info' && m.required && !isAnswered(m, s.followUpAnswers[m.id]),
    );
    return missing ? 'Please answer the questions marked required.' : null;
  },
};

export function validateStep(step: StepId, state: IntakeState): string | null {
  return VALIDATORS[step]?.(state) ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIntakeState(value: unknown): value is IntakeState {
  if (!isRecord(value)) return false;
  return (
    value.version === 1 &&
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
