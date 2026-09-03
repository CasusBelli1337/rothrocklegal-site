import { describe, expect, it } from 'vitest';
import { A11Y_STORAGE_KEY } from '@/config/a11y';
import {
  a11yValue,
  applyA11yPrefs,
  loadA11yPrefs,
  normalizeA11yPrefs,
  readA11yPrefs,
  saveA11yPrefs,
  withA11yPref,
} from './store';

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

describe('normalizeA11yPrefs', () => {
  it('keeps known non-default choices and drops everything else', () => {
    expect(
      normalizeA11yPrefs({ textSize: 'large', contrast: 'normal', motion: 'x', extra: 'wider' }),
    ).toEqual({ textSize: 'large' });
    expect(normalizeA11yPrefs(null)).toEqual({});
    expect(normalizeA11yPrefs('large')).toEqual({});
    expect(normalizeA11yPrefs({ textSize: 7 })).toEqual({});
  });
});

describe('withA11yPref and a11yValue', () => {
  it('sets a choice, and choosing the default removes it', () => {
    const large = withA11yPref({}, 'textSize', 'large');
    expect(large).toEqual({ textSize: 'large' });
    expect(a11yValue(large, 'textSize')).toBe('large');
    expect(a11yValue(large, 'contrast')).toBe('normal');
    expect(withA11yPref(large, 'textSize', 'normal')).toEqual({});
    expect(withA11yPref(large, 'motion', 'reduced')).toEqual({
      textSize: 'large',
      motion: 'reduced',
    });
  });
});

describe('dataset', () => {
  it('stamps chosen options and clears the rest', () => {
    const dataset: Record<string, string | undefined> = { motion: 'reduced', lens: 'trustee' };
    applyA11yPrefs({ textSize: 'larger', contrast: 'high' }, dataset);
    expect(dataset).toEqual({ textSize: 'larger', contrast: 'high', lens: 'trustee' });
    applyA11yPrefs({}, dataset);
    expect(dataset).toEqual({ lens: 'trustee' });
  });

  it('reads back what the boot script stamped, ignoring stray values', () => {
    expect(readA11yPrefs({ textSize: 'large', spacing: 'wider', lens: 'trustee' })).toEqual({
      textSize: 'large',
      spacing: 'wider',
    });
    expect(readA11yPrefs({ textSize: 'giant' })).toEqual({});
  });
});

describe('storage', () => {
  it('round-trips and removes the key when nothing is chosen', () => {
    const storage = memoryStorage();
    saveA11yPrefs({ contrast: 'high' }, storage);
    expect(storage.getItem(A11Y_STORAGE_KEY)).toBe('{"contrast":"high"}');
    expect(loadA11yPrefs(storage)).toEqual({ contrast: 'high' });
    saveA11yPrefs({}, storage);
    expect(storage.getItem(A11Y_STORAGE_KEY)).toBeNull();
  });

  it('returns nothing for garbage and never throws when storage is unavailable', () => {
    const storage = memoryStorage();
    storage.setItem(A11Y_STORAGE_KEY, '{not json');
    expect(loadA11yPrefs(storage)).toEqual({});
    expect(loadA11yPrefs(throwingStorage())).toEqual({});
    expect(() => saveA11yPrefs({ textSize: 'large' }, throwingStorage())).not.toThrow();
  });
});
