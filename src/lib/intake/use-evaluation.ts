'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage, getEvaluation, saveAnswers, startEvaluation, type Session } from './api';
import type { EvaluationClientView, IntakeAnswers } from './contract';
import { EVALUATION_STAGES } from './copy';

export type EvaluationPhase =
  | 'idle'
  | 'saving'
  | 'sending'
  | 'reading'
  | 'checking'
  | 'ready'
  | 'timeout'
  | 'error';

export { EVALUATION_STAGES };

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
// Measured evaluate latency is 41–300 s (Opus reading every upload); a whole case file runs longer still.
export const POLL_TIMEOUT_MS = 600_000;
const CHECKING_AFTER_MS = 30_000;
/** After this long the screen offers "Keep going while we finish reading"; the server finishes on its own. */
export const KEEP_GOING_AFTER_MS = 45_000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface EvaluationOptions {
  session: Session | null;
  answers: IntakeAnswers;
  onReady(view: EvaluationClientView): void;
  /** Timed out or failed: the manual screens take over. */
  onUnavailable(): void;
}

export interface EvaluationController {
  phase: EvaluationPhase;
  error: string | null;
  /** True once the wait has run past KEEP_GOING_AFTER_MS while still reading. */
  slow: boolean;
  start(): Promise<void>;
  /** Stops polling (the person chose to keep going); the server keeps reading. */
  cancel(): void;
}

/** Pass 2. Saves the answers, asks for the evaluation, and polls until it is ready or time runs out. */
export function useEvaluation({
  session,
  answers,
  onReady,
  onUnavailable,
}: EvaluationOptions): EvaluationController {
  const [phase, setPhase] = useState<EvaluationPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  const alive = useRef(true);
  const inFlight = useRef(false);
  const cancelled = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const listening = () => alive.current && !cancelled.current;

  const start = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    cancelled.current = false;
    setError(null);
    setSlow(false);
    try {
      if (!session) throw new Error('Your session expired. Go back to the start and try again.');
      setPhase('saving');
      await saveAnswers(session, answers);
      setPhase('sending');
      let result = await startEvaluation(session);
      const startedAt = Date.now();
      while (result.status !== 'follow-up' || !result.evaluation) {
        if (!listening()) return;
        const elapsed = Date.now() - startedAt;
        if (elapsed > POLL_TIMEOUT_MS) {
          setPhase('timeout');
          onUnavailable();
          return;
        }
        setPhase(elapsed > CHECKING_AFTER_MS ? 'checking' : 'reading');
        if (elapsed > KEEP_GOING_AFTER_MS) setSlow(true);
        await sleep(POLL_INTERVAL_MS);
        if (!listening()) return;
        result = await getEvaluation(session);
      }
      if (!listening()) return;
      setPhase('ready');
      onReady(result.evaluation);
    } catch (caught) {
      if (!listening()) return;
      setPhase('error');
      setError(errorMessage(caught));
      onUnavailable();
    } finally {
      inFlight.current = false;
    }
  }, [session, answers, onReady, onUnavailable]);

  const cancel = useCallback(() => {
    cancelled.current = true;
  }, []);

  return { phase, error, slow, start, cancel };
}
