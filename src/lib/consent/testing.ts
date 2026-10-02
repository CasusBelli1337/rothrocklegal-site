import { consentConfig } from '@/config/consent';
import type { ConsentRecord } from './store';

/** Test-only helpers for the consent store (imported by *.test.ts files, never by the site). */

export function memoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map<string, string>(Object.entries(initial));
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

export function throwingStorage(): Storage {
  const boom = () => {
    throw new Error('storage disabled');
  };
  return { length: 0, key: boom, getItem: boom, setItem: boom, removeItem: boom, clear: boom };
}

/** A record as the bar would save it now. */
export function recordOf(overrides: Partial<ConsentRecord> = {}): ConsentRecord {
  return {
    version: consentConfig.version,
    savedAt: Date.now(),
    granted: ['analytics'],
    signal: false,
    ...overrides,
  };
}

/** Storage holding `record` under the real key. */
export function storageWith(record: unknown): Storage {
  return memoryStorage({ [consentConfig.storageKey]: JSON.stringify(record) });
}
