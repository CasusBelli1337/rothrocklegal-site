'use client';

import { useEffect } from 'react';
import { startGa, stopGa, type TagHost } from '@/lib/analytics/tag';
import { useConsent } from '@/lib/consent/useConsent';

/** The real page as a TagHost; the loader only creates and appends one script and touches cookies. */
function browserHost(): TagHost {
  return {
    window: window as unknown as TagHost['window'],
    document: document as unknown as TagHost['document'],
    location,
  };
}

/** Runs `task` once the page has loaded and the browser is idle; returns a cancel function. */
export function whenPageIdle(task: () => void): () => void {
  let cancelled = false;
  let idle: number | undefined;
  const run = () => {
    if (!cancelled) task();
  };
  const schedule = () => {
    idle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(run, { timeout: 4000 })
        : window.setTimeout(run, 1);
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', schedule);
    if (idle !== undefined && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(idle);
    }
  };
}

/**
 * Starts GA4 only after a yes to analytics, and stops it (Consent Mode denied,
 * the tag switched off, its cookies removed) on a no, a withdrawal, or a privacy
 * signal. Before the visitor chooses, nothing from Google loads.
 */
export function GaLoader({ measurementId }: { measurementId: string }) {
  const { state } = useConsent();
  const { analytics, advertising } = state;

  useEffect(() => {
    if (!analytics) {
      stopGa(browserHost(), measurementId);
      return;
    }
    return whenPageIdle(() => startGa(browserHost(), measurementId, { analytics, advertising }));
  }, [analytics, advertising, measurementId]);

  return null;
}
