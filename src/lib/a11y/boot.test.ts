import { describe, expect, it } from 'vitest';
import { A11Y_STORAGE_KEY, a11yOptions } from '@/config/a11y';
import { a11yBootScript } from './boot';

/** Runs the inline script against fake globals and returns what it stamped on <html>. */
function run(stored: string | null, getItemThrows = false): Record<string, string> {
  const dataset: Record<string, string> = {};
  const localStorage = {
    getItem: () => {
      if (getItemThrows) throw new Error('blocked');
      return stored;
    },
  };
  const document = { documentElement: { dataset } };
  new Function('localStorage', 'document', a11yBootScript())(localStorage, document);
  return dataset;
}

describe('a11yBootScript', () => {
  it('stays small and makes no external calls', () => {
    const script = a11yBootScript();
    expect(Buffer.byteLength(script)).toBeLessThan(400);
    expect(script).not.toMatch(/fetch|XMLHttpRequest|http|import/);
    expect(script).toContain(`'${A11Y_STORAGE_KEY}'`);
  });

  it('stamps every stored non-default choice under its dataset key', () => {
    const stored = JSON.stringify({ textSize: 'larger', contrast: 'high', spacing: 'wider' });
    expect(run(stored)).toEqual({ textSize: 'larger', contrast: 'high', spacing: 'wider' });
    expect(run(JSON.stringify({ motion: 'reduced' }))).toEqual({ motion: 'reduced' });
  });

  it('accepts exactly the values config declares', () => {
    for (const option of a11yOptions) {
      for (const choice of option.values.slice(1)) {
        expect(run(JSON.stringify({ [option.key]: choice.value }))).toEqual({
          [option.key]: choice.value,
        });
      }
    }
  });

  it('ignores defaults, unknown keys, and unknown values', () => {
    expect(run(JSON.stringify({ textSize: 'normal', motion: 'full' }))).toEqual({});
    expect(run(JSON.stringify({ color: 'red', textSize: 'huge' }))).toEqual({});
    expect(run(JSON.stringify({ textSize: 'high' }))).toEqual({});
    expect(run(JSON.stringify({ textSize: 3 }))).toEqual({});
  });

  it('sets nothing when storage is empty, garbage, or throws', () => {
    expect(run(null)).toEqual({});
    expect(run('{oops')).toEqual({});
    expect(run('"large"')).toEqual({});
    expect(run('[1,2]')).toEqual({});
    expect(run(JSON.stringify({ textSize: 'large' }), true)).toEqual({});
  });
});
