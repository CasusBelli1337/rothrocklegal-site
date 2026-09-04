'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { resumeIntake } from './api';
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

/**
 * Handles `?resume=<token>` on /request-a-consult/: exchanges it once, after
 * hydration, and replaces the whole flow with the earlier request (story read
 * and evaluation included, so no screen waits twice). The "welcome back" line
 * stays until the person moves to another screen.
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
        const next = stateFromResume(response);
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
