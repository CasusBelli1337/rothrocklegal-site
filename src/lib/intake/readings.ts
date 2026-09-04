import {
  SITUATIONS,
  type EvaluationClientView,
  type Party,
  type SituationKey,
  type StoryRead,
} from './contract';
import type { IntakeState } from './state';

/**
 * The two model passes, as pure state transitions. Each pass is keyed to what
 * it read, so Back, Forward, and a refresh never run it again unless the
 * person changed the story (pass 1) or the story or files (pass 2).
 */

/** What pass 1 reads: the typed story, or the voice note standing in for it. */
export function storyKey(state: IntakeState): string {
  return `${state.answers.story.trim()}|${state.answers.voiceNoteFileId ?? ''}`;
}

export function needsStoryRead(state: IntakeState): boolean {
  return state.storyReadFor !== storyKey(state);
}

const KNOWN_SITUATIONS: ReadonlySet<string> = new Set(SITUATIONS.map((s) => s.key));

function knownSituations(keys: readonly string[]): SituationKey[] {
  return keys.filter((key): key is SituationKey => KNOWN_SITUATIONS.has(key));
}

function namedParties(parties: readonly Party[] | undefined): Party[] {
  return (parties ?? []).filter((p) => typeof p.name === 'string' && p.name.trim());
}

/** Pass 1 came back: keep it, and pre-tick the situations it found (the person can change them). */
export function receiveStoryRead(state: IntakeState, read: StoryRead): IntakeState {
  const situations = knownSituations(read.situations ?? []);
  return {
    ...state,
    storyRead: { ...read, situations, parties: namedParties(read.parties) },
    storyReadFor: storyKey(state),
    answers: { ...state.answers, situations },
  };
}

/** Pass 1 could not read the story: remember the attempt so the manual screens show once. */
export function markStoryReadUnavailable(state: IntakeState): IntakeState {
  return { ...state, storyRead: null, storyReadFor: storyKey(state) };
}

/** What pass 2 reads: the story plus every file sent so far. */
export function evaluationKey(state: IntakeState): string {
  const files = state.files
    .map((f) => f.id)
    .sort()
    .join(',');
  return `${storyKey(state)}|${files}`;
}

export function needsEvaluation(state: IntakeState): boolean {
  return state.evaluationFor !== evaluationKey(state);
}

/** The people list is seeded once, only while the person has not named anyone. */
function seedParties(state: IntakeState, parties: readonly Party[] | undefined): IntakeState {
  if (state.answers.parties.some((p) => p.name.trim())) return state;
  return { ...state, answers: { ...state.answers, parties: namedParties(parties) } };
}

/** Pass 2 came back: keep it and seed the people it found. Stale follow-up answers are dropped. */
export function receiveEvaluation(state: IntakeState, view: EvaluationClientView): IntakeState {
  const kept = new Set((view.modules ?? []).map((m) => m.id));
  const followUpAnswers = Object.fromEntries(
    Object.entries(state.followUpAnswers).filter(([id]) => kept.has(id)),
  );
  return seedParties(
    {
      ...state,
      evaluation: { ...view, modules: view.modules ?? [], parties: namedParties(view.parties) },
      evaluationFor: evaluationKey(state),
      followUpAnswers,
    },
    view.parties,
  );
}

/** Pass 2 timed out or failed: the manual screens take over, seeded from pass 1 when it ran. */
export function markEvaluationUnavailable(state: IntakeState): IntakeState {
  return seedParties(
    { ...state, evaluation: null, evaluationFor: evaluationKey(state), followUpAnswers: {} },
    state.storyRead?.parties,
  );
}

/** The one-line "what we understood", from the fuller pass when it ran. */
export function whatWeUnderstood(state: IntakeState): string | null {
  return state.evaluation?.whatWeUnderstood ?? state.storyRead?.whatWeUnderstood ?? null;
}
