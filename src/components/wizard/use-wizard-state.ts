'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { todayISO } from '@/lib/deadlines/dates';
import type { Concern, DateAnswerKey, WizardAnswers } from '@/lib/deadlines/types';
import type { ChoiceKey, WizardStep } from './steps';
import { activeSteps, pruneAnswers, validateStep } from './steps-logic';
import {
  clearWizardState,
  EMPTY_WIZARD_STATE,
  loadWizardState,
  saveWizardState,
  type WizardState,
} from './storage';

/** Everything the wizard UI needs: current step, answers, and the handlers. */
export interface WizardController {
  answers: WizardAnswers;
  steps: WizardStep[];
  stepIndex: number;
  step: WizardStep;
  isLast: boolean;
  showResults: boolean;
  error: string | null;
  /** True once the visitor has moved between screens, so the reveal runs (never on first paint). */
  navigated: boolean;
  onChoice(key: ChoiceKey, value: string): void;
  onDate(key: DateAnswerKey, value: string): void;
  onToggleConcern(concern: Concern, checked: boolean): void;
  next(event: React.FormEvent<HTMLFormElement>): void;
  back(): void;
  editAnswers(): void;
  startOver(): void;
}

/** State restored from localStorage after hydration and saved on every change. */
function usePersistedState(): [WizardState, Dispatch<SetStateAction<WizardState>>, boolean] {
  const [state, setState] = useState<WizardState>(EMPTY_WIZARD_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadWizardState();
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWizardState(state);
  }, [state, hydrated]);

  return [state, setState, hydrated];
}

function toggleConcern(answers: WizardAnswers, concern: Concern, checked: boolean): WizardAnswers {
  const rest = (answers.concerns ?? []).filter((c) => c !== concern);
  return { ...answers, concerns: checked ? [...rest, concern] : rest };
}

type Mutator = (answers: WizardAnswers) => WizardAnswers;

/** Applies an answer change, prunes answers that no longer apply, and clears any error. */
function useAnswerUpdater(
  setState: Dispatch<SetStateAction<WizardState>>,
  setError: Dispatch<SetStateAction<string | null>>,
): (mutate: Mutator) => void {
  return useCallback(
    (mutate: Mutator) => {
      setError(null);
      setState((prev) => ({ ...prev, answers: pruneAnswers(mutate(prev.answers)) }));
    },
    [setState, setError],
  );
}

export function useWizardState(): WizardController {
  const [state, setState, hydrated] = usePersistedState();
  const [error, setError] = useState<string | null>(null);
  const [navigated, setNavigated] = useState(false);
  const updateAnswers = useAnswerUpdater(setState, setError);

  const steps = useMemo(() => activeSteps(state.answers), [state.answers]);
  const stepIndex = Math.min(state.stepIndex, steps.length - 1);
  const step = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;

  const go = (patch: Partial<WizardState>) => {
    setError(null);
    setNavigated(true);
    setState((prev) => ({ ...prev, ...patch }));
  };

  return {
    answers: state.answers,
    steps,
    stepIndex,
    step,
    isLast,
    showResults: hydrated && state.showResults,
    error,
    navigated,
    onChoice: (key, value) => updateAnswers((a) => ({ ...a, [key]: value })),
    onDate: (key, value) => updateAnswers((a) => ({ ...a, [key]: value || undefined })),
    onToggleConcern: (concern, checked) => updateAnswers((a) => toggleConcern(a, concern, checked)),
    next(event) {
      event.preventDefault();
      const problem = validateStep(step, state.answers, todayISO());
      if (problem) {
        setError(problem);
        return;
      }
      go({ stepIndex: isLast ? stepIndex : stepIndex + 1, showResults: isLast });
    },
    back: () => go({ stepIndex: Math.max(0, stepIndex - 1) }),
    editAnswers: () => go({ showResults: false, stepIndex: steps.length - 1 }),
    startOver() {
      clearWizardState();
      go(EMPTY_WIZARD_STATE);
    },
  };
}
