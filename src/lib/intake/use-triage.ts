'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getTriage, saveAnswers, startTriage, type Session } from './api';
import type { IntakeAnswers, StoryRead } from './contract';

export type TriagePhase = 'idle' | 'reading' | 'ready' | 'unavailable';

export const TRIAGE_POLL_INTERVAL_MS = 2000;
export const TRIAGE_TIMEOUT_MS = 90_000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface TriageOptions {
  session: Session | null;
  answers: IntakeAnswers;
  onReady(read: StoryRead): void;
  /** The model could not read the story (or did not answer in time): the manual screen shows. */
  onUnavailable(): void;
}

export interface TriageController {
  phase: TriagePhase;
  start(): Promise<void>;
}

/**
 * Pass 1. Saves the story, asks the server to read it, and polls until the
 * read is ready, the server gives up, or 90 seconds pass. Every failure lands
 * on `onUnavailable`: the person can always pick their situations by hand.
 */
export function useTriage({ session, answers, onReady, onUnavailable }: TriageOptions) {
  const [phase, setPhase] = useState<TriagePhase>('idle');
  const alive = useRef(true);
  const inFlight = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const start = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPhase('reading');
    try {
      if (!session) throw new Error('no session');
      await saveAnswers(session, answers);
      let result = await startTriage(session);
      const startedAt = Date.now();
      while (result.status === 'reading') {
        if (!alive.current) return;
        if (Date.now() - startedAt > TRIAGE_TIMEOUT_MS) throw new Error('timeout');
        await sleep(TRIAGE_POLL_INTERVAL_MS);
        result = await getTriage(session);
      }
      if (!alive.current) return;
      if (result.status === 'ready' && result.storyRead) {
        setPhase('ready');
        onReady(result.storyRead);
        return;
      }
      throw new Error('unavailable');
    } catch {
      if (!alive.current) return;
      setPhase('unavailable');
      onUnavailable();
    } finally {
      inFlight.current = false;
    }
  }, [session, answers, onReady, onUnavailable]);

  return { phase, start } satisfies TriageController;
}
