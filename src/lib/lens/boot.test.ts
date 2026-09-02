import { describe, expect, it } from 'vitest';
import { lensConfig } from '@/config/lens';
import { lensBootScript } from './boot';
import { emptyLensState, resolveLens } from './store';

/** Runs the inline script against fake globals and returns what it set on <html>. */
function run(stored: string | null, getItemThrows = false): string | undefined {
  const dataset: Record<string, string> = {};
  const localStorage = {
    getItem: () => {
      if (getItemThrows) throw new Error('blocked');
      return stored;
    },
  };
  const document = { documentElement: { dataset } };
  new Function('localStorage', 'document', lensBootScript())(localStorage, document);
  return dataset.lens;
}

describe('lensBootScript', () => {
  it('stays small and makes no external calls', () => {
    const script = lensBootScript();
    expect(Buffer.byteLength(script)).toBeLessThan(400);
    expect(script).not.toMatch(/fetch|XMLHttpRequest|http|import/);
    expect(script).toContain(`'${lensConfig.storageKey}'`);
  });

  it('applies the same thresholds as resolveLens()', () => {
    for (const score of [-6, -3, -2, -1, 0, 1, 2, 3, 6]) {
      const expected = resolveLens({ ...emptyLensState(), score });
      const stored = JSON.stringify({ ...emptyLensState(), score });
      expect(run(stored), `score ${score}`).toBe(expected === 'neutral' ? undefined : expected);
    }
  });

  it('sets nothing when storage is empty, garbage, or throws', () => {
    expect(run(null)).toBeUndefined();
    expect(run('{oops')).toBeUndefined();
    expect(run(JSON.stringify({ score: 'high' }))).toBeUndefined();
    expect(run('{"score":5}', true)).toBeUndefined();
  });
});
