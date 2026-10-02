import {
  consentCategory,
  consentConfig,
  isOffered,
  offeredCategories,
  type OptionalCategory,
} from '@/config/consent';

/**
 * Consent state (docs/CONSENT.md): pure rules plus wrapped storage. The record
 * lives in localStorage `rl-consent`; every storage touch is wrapped so private
 * mode or a blocked origin leaves the safe default, which is "no" to everything.
 * The inline boot script (boot.ts) applies the same rules before first paint.
 */

/** What is saved: which optional categories got a yes, when, and whether a privacy signal was on. */
export interface ConsentRecord {
  version: number;
  /** Epoch milliseconds. */
  savedAt: number;
  granted: OptionalCategory[];
  /** True when the choice was made while the browser sent GPC or Do Not Track. */
  signal: boolean;
}

/** What may run right now. */
export type ConsentState = Record<OptionalCategory, boolean>;

/** Global Privacy Control, Do Not Track, or nothing. */
export type PrivacySignal = 'gpc' | 'dnt' | null;

/** The `html[data-consent]` value: 'ask' shows the bar; otherwise the granted categories, or 'none'. */
export type ConsentAttribute = string;

export const DENIED: ConsentState = Object.freeze({ analytics: false, advertising: false });

export const MAX_AGE_MS = consentConfig.maxAgeDays * 24 * 60 * 60 * 1000;

const OPTIONAL: readonly OptionalCategory[] = ['analytics', 'advertising'];

/** Reads the browser's privacy signal; GPC wins when both are on. */
export function privacySignal(nav: unknown): PrivacySignal {
  if (typeof nav !== 'object' || nav === null) return null;
  const { globalPrivacyControl, doNotTrack } = nav as {
    globalPrivacyControl?: unknown;
    doNotTrack?: unknown;
  };
  if (globalPrivacyControl === true) return 'gpc';
  if (doNotTrack === '1') return 'dnt';
  return null;
}

/** A stored value, or null when it is missing, malformed, or from another shape. */
export function parseRecord(input: unknown): ConsentRecord | null {
  if (typeof input !== 'object' || input === null) return null;
  const { version, savedAt, granted, signal } = input as Record<string, unknown>;
  if (typeof version !== 'number' || typeof savedAt !== 'number' || !Array.isArray(granted)) {
    return null;
  }
  return {
    version,
    savedAt,
    granted: OPTIONAL.filter((key) => granted.includes(key)),
    signal: signal === true,
  };
}

/**
 * A record counts only when it is this version, under 12 months old, and, if a
 * privacy signal is on now, was made while it was on (so the visitor saw the
 * signal note). Otherwise the visitor is asked again (CCPA regs § 7025(c)(3)).
 */
export function isRecordCurrent(
  record: ConsentRecord | null,
  now: number,
  signal: PrivacySignal,
): record is ConsentRecord {
  if (!record || record.version !== consentConfig.version) return false;
  const age = now - record.savedAt;
  if (!(age >= 0 && age < MAX_AGE_MS)) return false;
  return record.signal || signal === null;
}

/** True when the bar should ask: something is offered and there is no current choice. */
export function needsChoice(
  record: ConsentRecord | null,
  now: number,
  signal: PrivacySignal,
): boolean {
  return offeredCategories().length > 0 && !isRecordCurrent(record, now, signal);
}

/** A category may run only with a current yes; a sale-or-share category never runs under a signal. */
function allowed(key: OptionalCategory, record: ConsentRecord, signal: PrivacySignal): boolean {
  if (!isOffered(key) || !record.granted.includes(key)) return false;
  return !(consentCategory(key).saleOrShare && signal !== null);
}

/** What may run now. No current record means everything optional is off. */
export function effectiveConsent(
  record: ConsentRecord | null,
  now: number,
  signal: PrivacySignal,
): ConsentState {
  if (!isRecordCurrent(record, now, signal)) return DENIED;
  return {
    analytics: allowed('analytics', record, signal),
    advertising: allowed('advertising', record, signal),
  };
}

/** The record a choice saves; categories that are not offered, or are blocked by the signal, are dropped. */
export function makeRecord(
  choice: ConsentState,
  now: number,
  signal: PrivacySignal,
): ConsentRecord {
  const draft: ConsentRecord = {
    version: consentConfig.version,
    savedAt: now,
    granted: OPTIONAL.filter((key) => choice[key]),
    signal: signal !== null,
  };
  return { ...draft, granted: OPTIONAL.filter((key) => allowed(key, draft, signal)) };
}

/** The value stamped on html[data-consent]; the boot script computes the same. */
export function consentAttribute(
  record: ConsentRecord | null,
  now: number,
  signal: PrivacySignal,
): ConsentAttribute {
  if (needsChoice(record, now, signal)) return 'ask';
  const state = effectiveConsent(record, now, signal);
  const granted = OPTIONAL.filter((key) => state[key]);
  return granted.length > 0 ? granted.join(' ') : 'none';
}

function storageOf(storage?: Storage): Storage | undefined {
  try {
    return storage ?? globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function loadRecord(storage?: Storage): ConsentRecord | null {
  try {
    const raw = storageOf(storage)?.getItem(consentConfig.storageKey);
    return raw ? parseRecord(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Returns false when storage is unavailable: the choice then lasts for this page only. */
export function saveRecord(record: ConsentRecord, storage?: Storage): boolean {
  try {
    const store = storageOf(storage);
    if (!store) return false;
    store.setItem(consentConfig.storageKey, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}
