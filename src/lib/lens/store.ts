import { lensConfig } from '@/config/lens';
import type { Lens, LensEffect, LensState } from './types';

/**
 * Lens state in localStorage (`rl-lens`). Every storage touch is wrapped:
 * private mode, a full quota, or a blocked origin simply leaves the site
 * neutral. The pure pieces (resolve, apply) take the state as an argument.
 */

export function emptyLensState(): LensState {
  return { score: 0, signals: [], updatedAt: new Date(0).toISOString() };
}

export function resolveLens(state: LensState | null | undefined): Lens {
  const score = state?.score ?? 0;
  if (score >= lensConfig.trusteeAt) return 'trustee';
  if (score <= lensConfig.beneficiaryAt) return 'beneficiary';
  return 'neutral';
}

function clamp(score: number): number {
  const limit = lensConfig.scoreLimit;
  return Math.max(-limit, Math.min(limit, score));
}

function seenRecently(state: LensState, key: string, now: Date): boolean {
  const cutoff = now.getTime() - lensConfig.dedupeWindowMs;
  return state.signals.some((s) => s.key === key && Date.parse(s.at) >= cutoff);
}

/** Returns the same object when the effect is a duplicate, so callers can skip the save. */
export function applyEffect(state: LensState, effect: LensEffect, now = new Date()): LensState {
  const isSet = 'set' in effect;
  if (!isSet && seenRecently(state, effect.key, now)) return state;
  const score = clamp(isSet ? effect.set : state.score + effect.weight);
  const at = now.toISOString();
  const signal = { key: effect.key, weight: score - state.score, at };
  const signals = [...state.signals, signal].slice(-lensConfig.maxSignals);
  return { score, signals, updatedAt: at };
}

function storageOf(storage?: Storage): Storage | undefined {
  try {
    return storage ?? globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function isLensState(value: unknown): value is LensState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return Number.isFinite(v.score) && Array.isArray(v.signals) && typeof v.updatedAt === 'string';
}

export function loadLensState(storage?: Storage): LensState | null {
  try {
    const raw = storageOf(storage)?.getItem(lensConfig.storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isLensState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLensState(state: LensState, storage?: Storage): void {
  try {
    storageOf(storage)?.setItem(lensConfig.storageKey, JSON.stringify(state));
  } catch {
    // Storage unavailable: the visit stays neutral, nothing else changes.
  }
}

/** True the first time a sessionStorage flag is claimed this tab session; false after (or when storage throws). */
export function claimSessionFlag(key: string): boolean {
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
    return true;
  } catch {
    return false;
  }
}

const listeners = new Set<() => void>();

/** In-tab changes notify directly; the `storage` event covers other tabs. */
export function subscribeLens(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === lensConfig.storageKey) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function currentLens(): Lens {
  return resolveLens(loadLensState());
}

export function recordEffect(effect: LensEffect, now = new Date()): LensState {
  const before = loadLensState() ?? emptyLensState();
  const after = applyEffect(before, effect, now);
  if (after !== before) {
    saveLensState(after);
    listeners.forEach((listener) => listener());
  }
  return after;
}

/** Forgets the score and the tab's landing flag (the preview switcher's Reset). */
export function clearLensState(storage?: Storage): void {
  try {
    storageOf(storage)?.removeItem(lensConfig.storageKey);
    sessionStorage.removeItem(lensConfig.landingKey);
  } catch {
    // Nothing stored, or storage unavailable.
  }
  listeners.forEach((listener) => listener());
}
