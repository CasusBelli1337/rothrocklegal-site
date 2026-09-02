import { describe, expect, it } from 'vitest';
import { lensConfig } from '@/config/lens';
import { applyEffect, emptyLensState, loadLensState, resolveLens, saveLensState } from './store';
import type { LensState } from './types';

const T0 = new Date('2026-09-01T10:00:00Z');
const minutesLater = (minutes: number) => new Date(T0.getTime() + minutes * 60_000);
const withScore = (score: number): LensState => ({ ...emptyLensState(), score });

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
  };
}

function throwingStorage(): Storage {
  const boom = () => {
    throw new Error('storage disabled');
  };
  return { length: 0, key: boom, getItem: boom, setItem: boom, removeItem: boom, clear: boom };
}

describe('resolveLens', () => {
  it('reads the thresholds from config: ≥ 2 trustee, ≤ -2 beneficiary, between neutral', () => {
    expect(lensConfig.trusteeAt).toBe(2);
    expect(lensConfig.beneficiaryAt).toBe(-2);
    expect(resolveLens(withScore(3))).toBe('trustee');
    expect(resolveLens(withScore(2))).toBe('trustee');
    expect(resolveLens(withScore(1))).toBe('neutral');
    expect(resolveLens(withScore(0))).toBe('neutral');
    expect(resolveLens(withScore(-1))).toBe('neutral');
    expect(resolveLens(withScore(-2))).toBe('beneficiary');
    expect(resolveLens(withScore(-6))).toBe('beneficiary');
  });

  it('treats no state as neutral', () => {
    expect(resolveLens(null)).toBe('neutral');
    expect(resolveLens(undefined)).toBe('neutral');
  });

  it('has hysteresis: a framed lens survives one small step the other way', () => {
    let state = applyEffect(emptyLensState(), { key: 'a', weight: 3 }, T0);
    expect(resolveLens(state)).toBe('trustee');
    state = applyEffect(state, { key: 'b', weight: -1 }, minutesLater(1));
    expect(resolveLens(state)).toBe('trustee');
    state = applyEffect(state, { key: 'c', weight: -1 }, minutesLater(2));
    expect(resolveLens(state)).toBe('neutral');
    state = applyEffect(state, { key: 'd', weight: -2 }, minutesLater(3));
    expect(state.score).toBe(-1);
    expect(resolveLens(state)).toBe('neutral');
    state = applyEffect(state, { key: 'e', weight: -1 }, minutesLater(4));
    expect(resolveLens(state)).toBe('beneficiary');
  });
});

describe('applyEffect', () => {
  it('adds the weight and logs the signal', () => {
    const state = applyEffect(emptyLensState(), { key: '/for-trustees/', weight: 2 }, T0);
    expect(state.score).toBe(2);
    expect(state.signals).toEqual([{ key: '/for-trustees/', weight: 2, at: T0.toISOString() }]);
    expect(state.updatedAt).toBe(T0.toISOString());
  });

  it('does not count the same key twice inside the ten-minute window', () => {
    const first = applyEffect(emptyLensState(), { key: '/for-trustees/', weight: 2 }, T0);
    const again = applyEffect(first, { key: '/for-trustees/', weight: 1 }, minutesLater(9));
    expect(again).toBe(first);
    const later = applyEffect(first, { key: '/for-trustees/', weight: 1 }, minutesLater(11));
    expect(later.score).toBe(3);
    const other = applyEffect(first, { key: '/complex-estates/', weight: 1 }, minutesLater(1));
    expect(other.score).toBe(3);
  });

  it('sets the score outright for switch effects, ignoring the window', () => {
    let state = applyEffect(emptyLensState(), { key: 'switch:beneficiary', set: -3 }, T0);
    expect(state.score).toBe(-3);
    state = applyEffect(state, { key: 'x', weight: 4 }, minutesLater(1));
    expect(state.score).toBe(1);
    state = applyEffect(state, { key: 'switch:beneficiary', set: -3 }, minutesLater(2));
    expect(state.score).toBe(-3);
    expect(state.signals.at(-1)).toEqual({
      key: 'switch:beneficiary',
      weight: -4,
      at: minutesLater(2).toISOString(),
    });
  });

  it('clamps the score so a few clicks always bring it back', () => {
    let state = emptyLensState();
    for (let i = 0; i < 10; i += 1)
      state = applyEffect(state, { key: `t${i}`, weight: 2 }, minutesLater(i));
    expect(state.score).toBe(lensConfig.scoreLimit);
    for (let i = 0; i < 10; i += 1)
      state = applyEffect(state, { key: `b${i}`, weight: -2 }, minutesLater(20 + i));
    expect(state.score).toBe(-lensConfig.scoreLimit);
  });

  it('keeps at most thirty signals', () => {
    let state = emptyLensState();
    for (let i = 0; i < 40; i += 1)
      state = applyEffect(state, { key: `k${i}`, weight: 1 }, minutesLater(i));
    expect(state.signals).toHaveLength(lensConfig.maxSignals);
    expect(state.signals[0].key).toBe('k10');
  });
});

describe('storage', () => {
  it('round-trips through localStorage', () => {
    const storage = memoryStorage();
    const state = applyEffect(emptyLensState(), { key: '/trust-contests/', weight: -2 }, T0);
    saveLensState(state, storage);
    expect(loadLensState(storage)).toEqual(state);
    expect(storage.getItem(lensConfig.storageKey)).toContain('"score":-2');
  });

  it('returns null for nothing, garbage, or the wrong shape', () => {
    const storage = memoryStorage();
    expect(loadLensState(storage)).toBeNull();
    storage.setItem(lensConfig.storageKey, '{not json');
    expect(loadLensState(storage)).toBeNull();
    storage.setItem(lensConfig.storageKey, JSON.stringify({ score: 'high', signals: [] }));
    expect(loadLensState(storage)).toBeNull();
  });

  it('never throws when storage is unavailable', () => {
    const storage = throwingStorage();
    expect(loadLensState(storage)).toBeNull();
    expect(() => saveLensState(emptyLensState(), storage)).not.toThrow();
    expect(loadLensState()).toBeNull();
  });
});
