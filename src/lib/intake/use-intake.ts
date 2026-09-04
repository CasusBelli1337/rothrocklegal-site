'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createIntake, errorMessage, saveAnswers, saveFollowUp } from './api';
import type {
  EvaluationClientView,
  FollowUpAnswer,
  IntakeFile,
  StoryRead,
  SubmitResponse,
} from './contract';
import { withUploadAnswers } from './follow-up';
import {
  markEvaluationBackground,
  markEvaluationUnavailable,
  markStoryReadUnavailable,
  receiveEvaluation,
  receiveStoryRead,
} from './readings';
import {
  LAST_START_TILE,
  clearState,
  emptyState,
  loadState,
  mergeAnswers,
  nextStep,
  prevStep,
  saveState,
  type AnswersPatch,
  type IntakeState,
  type StartTile,
  type StepId,
} from './state';
import { validateStep } from './validate';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type Updater = (state: IntakeState) => IntakeState;

/** Everything the step screens need: the state, the step machine, and the mutators. */
export interface IntakeController {
  state: IntakeState;
  hydrated: boolean;
  /** True once the visitor has moved between screens, so the page scrolls and focus follows the heading. */
  navigated: boolean;
  error: string | null;
  busy: boolean;
  saveStatus: SaveStatus;
  /** Any change clears the last validation message: the visitor is acting on it. */
  update(fn: Updater): void;
  patchAnswers(patch: AnswersPatch): void;
  setError(message: string | null): void;
  /** The next tile on the start step, otherwise the next screen (after validation). */
  next(): Promise<void>;
  back(): void;
  goTo(step: StepId): void;
  startOver(): void;
  /** Replaces the whole flow (an emailed link brought back an earlier request). */
  restore(next: IntakeState): void;
  addFile(file: IntakeFile): void;
  removeFile(fileId: string): void;
  setFollowUpAnswer(id: string, answer: FollowUpAnswer): void;
  clearFollowUpAnswer(id: string): void;
  receiveStoryRead(read: StoryRead): void;
  markStoryReadUnavailable(): void;
  receiveEvaluation(view: EvaluationClientView): void;
  markEvaluationUnavailable(): void;
  /** "Keep going while we finish reading": the server completes the pass in the background. */
  markEvaluationBackground(): void;
  finish(result: SubmitResponse): void;
}

const AUTOSAVE_DELAY_MS = 800;

/** Restored from localStorage after hydration and written back on every change. */
function usePersistedState(): [IntakeState, (fn: Updater) => void, boolean] {
  const [state, setState] = useState<IntakeState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState();
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const setPersisted = useCallback((fn: Updater) => setState((prev) => fn(prev)), []);
  return [state, setPersisted, hydrated];
}

/** Debounced save once a server session exists; the first run after hydration is skipped. */
function useDebouncedSave(ready: boolean, save: () => Promise<unknown>): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const skipNext = useRef(true);

  useEffect(() => {
    if (!ready) return;
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    setStatus('saving');
    const timer = setTimeout(() => {
      save()
        .then(() => setStatus('saved'))
        .catch(() => setStatus('error'));
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready, save]);

  return status;
}

/** Loudest of the two save lines: a save in flight wins, then a failure, then a success. */
const STATUS_RANK: Record<SaveStatus, number> = { idle: 0, saved: 1, error: 2, saving: 3 };
function loudest(a: SaveStatus, b: SaveStatus): SaveStatus {
  return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b;
}

/**
 * `PUT answers` and `PUT follow-up`, both debounced. The follow-up answers used
 * to reach the server only at Send, so a closed tab lost them; the whole map
 * goes every time because the server replaces rather than merges.
 */
function useAutosave(state: IntakeState, hydrated: boolean): SaveStatus {
  const { session, answers, files, followUpAnswers } = state;
  const modules = state.evaluation?.modules;

  const putAnswers = useCallback(
    () => (session ? saveAnswers(session, answers) : Promise.resolve()),
    [session, answers],
  );
  const followUp = useMemo(
    () =>
      modules && modules.length > 0 ? withUploadAnswers(modules, followUpAnswers, files) : null,
    [modules, followUpAnswers, files],
  );
  const putFollowUp = useCallback(
    () => (session && followUp ? saveFollowUp(session, followUp) : Promise.resolve()),
    [session, followUp],
  );

  const started = hydrated && session !== null;
  const answersStatus = useDebouncedSave(started, putAnswers);
  const followUpStatus = useDebouncedSave(started && followUp !== null, putFollowUp);
  return loudest(answersStatus, followUpStatus);
}

/** The start step's Start button: the session is created here, once. */
async function beginSession(
  state: IntakeState,
  update: (fn: Updater) => void,
): Promise<string | null> {
  if (state.session) return null;
  try {
    const session = await createIntake();
    update((s) => ({ ...s, session, answers: { ...s.answers, acknowledgedDisclaimers: true } }));
    return null;
  } catch (caught) {
    return errorMessage(caught);
  }
}

export function useIntake(): IntakeController {
  const [state, setPersisted, hydrated] = usePersistedState();
  const saveStatus = useAutosave(state, hydrated);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [navigated, setNavigated] = useState(false);

  const update = useCallback(
    (fn: Updater) => {
      setError(null);
      setPersisted(fn);
    },
    [setPersisted],
  );

  /** A screen change: the flow scrolls to the panel and focuses the heading. */
  const move = useCallback(
    (fn: Updater) => {
      setNavigated(true);
      update(fn);
    },
    [update],
  );

  const goTo = useCallback((step: StepId) => move((s) => ({ ...s, step })), [move]);

  const next = useCallback(async () => {
    const problem = validateStep(state.step, state);
    if (problem) {
      setError(problem);
      return;
    }
    if (state.step === 'start' && state.startTile < LAST_START_TILE) {
      move((s) => ({ ...s, startTile: (s.startTile + 1) as StartTile }));
      return;
    }
    if (state.step === 'start') {
      setBusy(true);
      const failure = await beginSession(state, update);
      setBusy(false);
      if (failure) {
        setError(failure);
        return;
      }
    }
    goTo(nextStep(state));
  }, [state, update, move, goTo]);

  const back = useCallback(() => {
    if (state.step === 'start') {
      move((s) => ({ ...s, startTile: Math.max(0, s.startTile - 1) as StartTile }));
      return;
    }
    goTo(prevStep(state));
  }, [state, move, goTo]);

  return {
    state,
    hydrated,
    navigated,
    error,
    busy,
    saveStatus,
    update,
    setError,
    next,
    back,
    goTo,
    ...useMutators(update, move),
  };
}

type Mutators = Pick<
  IntakeController,
  | 'patchAnswers'
  | 'restore'
  | 'startOver'
  | 'addFile'
  | 'removeFile'
  | 'setFollowUpAnswer'
  | 'clearFollowUpAnswer'
  | 'receiveStoryRead'
  | 'markStoryReadUnavailable'
  | 'receiveEvaluation'
  | 'markEvaluationUnavailable'
  | 'markEvaluationBackground'
  | 'finish'
>;

/** The mutators keep one identity for the life of the flow, so effects that depend on them run once. */
function useMutators(update: (fn: Updater) => void, move: (fn: Updater) => void): Mutators {
  return useMemo(
    () => ({
      patchAnswers: (patch) =>
        update((s) => ({ ...s, answers: mergeAnswers(s.answers, patch) })),
      restore: (next) => move(() => next),
      startOver: () => {
        clearState();
        move(() => emptyState());
      },
      addFile: (file) => update((s) => ({ ...s, files: [...s.files, file] })),
      removeFile: (fileId) =>
        update((s) => ({ ...s, files: s.files.filter((f) => f.id !== fileId) })),
      setFollowUpAnswer: (id, answer) =>
        update((s) => ({ ...s, followUpAnswers: { ...s.followUpAnswers, [id]: answer } })),
      clearFollowUpAnswer: (id) =>
        update((s) => {
          const rest = { ...s.followUpAnswers };
          delete rest[id];
          return { ...s, followUpAnswers: rest };
        }),
      receiveStoryRead: (read) => update((s) => receiveStoryRead(s, read)),
      markStoryReadUnavailable: () => update(markStoryReadUnavailable),
      receiveEvaluation: (view) => update((s) => receiveEvaluation(s, view)),
      markEvaluationUnavailable: () => update(markEvaluationUnavailable),
      markEvaluationBackground: () => update(markEvaluationBackground),
      finish: (result) => move((s) => ({ ...s, result, step: 'done' })),
    }),
    [update, move],
  );
}
