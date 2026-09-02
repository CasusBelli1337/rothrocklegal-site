'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage, getEvaluation, saveAnswers, startEvaluation, type Session } from './api';
import type { EvaluationClientView, IntakeAnswers } from './contract';

export type EvaluationPhase =
  | 'idle'
  | 'saving'
  | 'sending'
  | 'reading'
  | 'checking'
  | 'ready'
  | 'timeout'
  | 'error';

/** The three status lines the client watches while the server reads the intake (INTAKE-SPEC §2 step 7). */
export const EVALUATION_STAGES = [
  'Sending your documents…',
  'Reading what you sent…',
  'Checking for gaps…',
] as const;

/** Which stage line a phase lights up; null when nothing is in flight. */
export function stageIndex(phase: EvaluationPhase): number | null {
  switch (phase) {
    case 'saving':
    case 'sending':
      return 0;
    case 'reading':
      return 1;
    case 'checking':
      return 2;
    default:
      return null;
  }
}

export const POLL_INTERVAL_MS = 3000;
// Measured evaluate latency is 95–300 s (Opus 5 reading every upload); allow headroom.
export const POLL_TIMEOUT_MS = 600_000;
const CHECKING_AFTER_MS = 30_000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface EvaluationOptions {
  session: Session | null;
  answers: IntakeAnswers;
  onReady(view: EvaluationClientView): void;
}

export interface EvaluationController {
  phase: EvaluationPhase;
  error: string | null;
  start(): Promise<void>;
}

/** Saves the final answers, asks for the evaluation, and polls until it is ready or time runs out. */
export function useEvaluation({
  session,
  answers,
  onReady,
}: EvaluationOptions): EvaluationController {
  const [phase, setPhase] = useState<EvaluationPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const start = useCallback(async () => {
    if (!session) {
      setPhase('error');
      setError('Your session expired. Go back to the start and try again.');
      return;
    }
    setError(null);
    try {
      setPhase('saving');
      await saveAnswers(session, answers);
      setPhase('sending');
      let result = await startEvaluation(session);
      const startedAt = Date.now();
      while (result.status !== 'follow-up' || !result.evaluation) {
        if (!alive.current) return;
        const elapsed = Date.now() - startedAt;
        if (elapsed > POLL_TIMEOUT_MS) {
          setPhase('timeout');
          return;
        }
        setPhase(elapsed > CHECKING_AFTER_MS ? 'checking' : 'reading');
        await sleep(POLL_INTERVAL_MS);
        result = await getEvaluation(session);
      }
      if (!alive.current) return;
      setPhase('ready');
      onReady(result.evaluation);
    } catch (caught) {
      if (!alive.current) return;
      setPhase('error');
      setError(errorMessage(caught));
    }
  }, [session, answers, onReady]);

  return { phase, error, start };
}
