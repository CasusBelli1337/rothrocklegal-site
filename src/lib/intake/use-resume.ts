'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getEvaluation, resumeIntake, type Session } from './api';
import type { EvaluationClientView, IntakeStatus } from './contract';
import { RESUME_PARAM, isResumeResponse, readResumeToken, stateFromResume } from './resume';
import type { StepId } from './state';
import type { IntakeController } from './use-intake';

export type ResumePhase = 'idle' | 'loading' | 'restored' | 'failed';

export interface ResumeController {
  phase: ResumePhase;
}

/** Takes the token out of the address bar so a refresh does not spend a used link again. */
function stripResumeToken(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(RESUME_PARAM);
  window.history.replaceState(window.history.state, '', url.toString());
}

/** The follow-up screen needs the evaluation's modules; the resume answer does not carry them. */
async function evaluationFor(
  session: Session,
  status: IntakeStatus,
): Promise<EvaluationClientView | null> {
  if (status !== 'follow-up') return null;
  try {
    return (await getEvaluation(session)).evaluation ?? null;
  } catch {
    return null;
  }
}

/**
 * Handles `?resume=<token>` on /request-a-consult/: exchanges it once, after
 * hydration, and replaces the whole flow with the earlier request. The
 * "welcome back" line stays until the person moves to another screen.
 */
export function useResume(intake: IntakeController): ResumeController {
  const [phase, setPhase] = useState<ResumePhase>('idle');
  const [restoredAt, setRestoredAt] = useState<StepId | null>(null);
  const started = useRef(false);
  const { hydrated, restore } = intake;

  const run = useCallback(
    async (token: string) => {
      setPhase('loading');
      try {
        const response = await resumeIntake(token);
        if (!isResumeResponse(response)) throw new Error('unexpected resume shape');
        const evaluation = await evaluationFor(response.session, response.session.status);
        const next = stateFromResume(response, evaluation);
        restore(next);
        setRestoredAt(next.step);
        setPhase('restored');
      } catch {
        setPhase('failed');
      }
    },
    [restore],
  );

  useEffect(() => {
    if (!hydrated || started.current) return;
    const token = readResumeToken(window.location.search);
    if (!token) return;
    started.current = true;
    stripResumeToken();
    void run(token);
  }, [hydrated, run]);

  const moved = phase === 'restored' && intake.state.step !== restoredAt;
  return { phase: moved ? 'idle' : phase };
}
