'use client';

import { useSyncExternalStore } from 'react';
import {
  type ConsentSnapshot,
  consentSnapshot,
  serverConsentSnapshot,
  subscribeConsent,
} from './client';

/** The visitor's privacy choice. The server, and hydration, see "no choice needed" with everything off. */
export function useConsent(): ConsentSnapshot {
  return useSyncExternalStore(subscribeConsent, consentSnapshot, serverConsentSnapshot);
}

const noop = () => () => {};

/** False during the server render and hydration, true after: lets the bar match the static HTML first. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
