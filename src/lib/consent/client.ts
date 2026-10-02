import type { OptionalCategory } from '@/config/consent';
import {
  type ConsentRecord,
  type ConsentState,
  consentAttribute,
  DENIED,
  effectiveConsent,
  loadRecord,
  makeRecord,
  needsChoice,
  type PrivacySignal,
  privacySignal,
  saveRecord,
} from './store';

/**
 * The page's one copy of the visitor's privacy choice. The bar, the footer link,
 * the GA4 loader, and trackEvent all read it; saveConsent is the one write path:
 * store it, stamp html[data-consent], tell every reader.
 */
export interface ConsentSnapshot {
  record: ConsentRecord | null;
  signal: PrivacySignal;
  state: ConsentState;
  needsChoice: boolean;
  /** Opened from a "Privacy choices" control (the footer link or the privacy policy). */
  panelOpen: boolean;
}

const SERVER_SNAPSHOT: ConsentSnapshot = Object.freeze({
  record: null,
  signal: null,
  state: DENIED,
  needsChoice: false,
  panelOpen: false,
});

const listeners = new Set<() => void>();
let snapshot: ConsentSnapshot | null = null;
let panelOpen = false;
/** Holds the choice for this page when storage is blocked. */
let pageOnlyRecord: ConsentRecord | null = null;

function compute(): ConsentSnapshot {
  const record = loadRecord() ?? pageOnlyRecord;
  const signal = privacySignal(globalThis.navigator);
  const now = Date.now();
  return {
    record,
    signal,
    state: effectiveConsent(record, now, signal),
    needsChoice: needsChoice(record, now, signal),
    panelOpen,
  };
}

export function serverConsentSnapshot(): ConsentSnapshot {
  return SERVER_SNAPSHOT;
}

/** Stable between changes, as useSyncExternalStore requires. */
export function consentSnapshot(): ConsentSnapshot {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;
  snapshot ??= compute();
  return snapshot;
}

/** Re-reads storage and the signal, re-stamps <html>, and notifies every reader. */
export function refreshConsent(): void {
  snapshot = compute();
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.consent = consentAttribute(
      snapshot.record,
      Date.now(),
      snapshot.signal,
    );
  }
  listeners.forEach((listener) => listener());
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Saves a choice and closes the bar. */
export function saveConsent(choice: ConsentState): void {
  const record = makeRecord(choice, Date.now(), privacySignal(globalThis.navigator));
  pageOnlyRecord = saveRecord(record) ? null : record;
  panelOpen = false;
  refreshConsent();
}

export function openConsentPanel(): void {
  panelOpen = true;
  refreshConsent();
}

export function closeConsentPanel(): void {
  panelOpen = false;
  refreshConsent();
}

/** True only with a current yes for `key`; false on the server and before any choice. */
export function hasConsent(key: OptionalCategory): boolean {
  return consentSnapshot().state[key];
}
