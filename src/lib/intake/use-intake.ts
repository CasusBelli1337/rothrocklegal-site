'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createIntake, errorMessage, saveAnswers } from './api';
import type { EvaluationClientView, FollowUpAnswer, IntakeFile, SubmitResponse } from './contract';
import {
  clearState,
  emptyState,
  loadState,
  mergeAnswers,
  nextStep,
  prevStep,
  saveState,
  validateStep,
  type AnswersPatch,
  type IntakeState,
  type StepId,
} from './state';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type Updater = (state: IntakeState) => IntakeState;

/** Everything the step screens need: the state, the step machine, and the mutators. */
export interface IntakeController {
  state: IntakeState;
  hydrated: boolean;
  /** True once the visitor has moved between steps, so focus follows the heading. */
  navigated: boolean;
  error: string | null;
  busy: boolean;
  saveStatus: SaveStatus;
  /** Any change clears the last validation message: the visitor is acting on it. */
  update(fn: Updater): void;
  patchAnswers(patch: AnswersPatch): void;
  setError(message: string | null): void;
  next(): Promise<void>;
  back(): void;
  goTo(step: StepId): void;
  startOver(): void;
  addFile(file: IntakeFile): void;
  removeFile(fileId: string): void;
  setFollowUpAnswer(id: string, answer: FollowUpAnswer): void;
  setEvaluation(view: EvaluationClientView | null): void;
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

/** Debounced `PUT answers` once a server session exists; the first run after hydration is skipped. */
function useAutosave(state: IntakeState, hydrated: boolean): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const skipNext = useRef(true);
  const { session, answers } = state;

  useEffect(() => {
    if (!hydrated || !session) return;
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    setStatus('saving');
    const timer = setTimeout(() => {
      saveAnswers(session, answers)
        .then(() => setStatus('saved'))
        .catch(() => setStatus('error'));
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [session, answers, hydrated]);

  return status;
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

  const goTo = useCallback(
    (step: StepId) => {
      setNavigated(true);
      update((s) => ({ ...s, step }));
    },
    [update],
  );

  const patchAnswers = useCallback(
    (patch: AnswersPatch) => update((s) => ({ ...s, answers: mergeAnswers(s.answers, patch) })),
    [update],
  );

  const next = useCallback(async () => {
    const problem = validateStep(state.step, state);
    if (problem) {
      setError(problem);
      return;
    }
    if (state.step === 'start' && !state.session) {
      setBusy(true);
      try {
        const session = await createIntake();
        update((s) => ({
          ...s,
          session,
          answers: { ...s.answers, acknowledgedDisclaimers: true },
        }));
      } catch (caught) {
        setError(errorMessage(caught));
        return;
      } finally {
        setBusy(false);
      }
    }
    goTo(nextStep(state.step));
  }, [state, update, goTo]);

  return {
    state,
    hydrated,
    navigated,
    error,
    busy,
    saveStatus,
    update,
    patchAnswers,
    setError,
    next,
    goTo,
    back: () => goTo(prevStep(state.step)),
    startOver() {
      clearState();
      setNavigated(true);
      update(() => emptyState());
    },
    addFile: (file) => update((s) => ({ ...s, files: [...s.files, file] })),
    removeFile: (fileId) =>
      update((s) => ({ ...s, files: s.files.filter((f) => f.id !== fileId) })),
    setFollowUpAnswer: (id, answer) =>
      update((s) => ({ ...s, followUpAnswers: { ...s.followUpAnswers, [id]: answer } })),
    setEvaluation: (evaluation) => update((s) => ({ ...s, evaluation })),
    finish: (result) => {
      setNavigated(true);
      update((s) => ({ ...s, result, step: 'done' }));
    },
  };
}
