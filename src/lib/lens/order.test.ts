import { describe, expect, it } from 'vitest';
import { lensOrderStyle } from './order';

const KEYS = ['a', 'b', 'c', 'd'];

describe('lensOrderStyle', () => {
  it('moves the named keys first under that lens and keeps the rest in order', () => {
    const first = { trustee: ['d', 'b'] };
    expect(lensOrderStyle('d', KEYS, first)).toEqual({ '--lens-order-trustee': 0 });
    expect(lensOrderStyle('b', KEYS, first)).toEqual({ '--lens-order-trustee': 1 });
    expect(lensOrderStyle('a', KEYS, first)).toEqual({ '--lens-order-trustee': 2 });
    expect(lensOrderStyle('c', KEYS, first)).toEqual({ '--lens-order-trustee': 3 });
  });

  it('sets nothing for lenses without an order (neutral always keeps DOM order)', () => {
    expect(lensOrderStyle('a', KEYS, {})).toEqual({});
    expect(lensOrderStyle('a', KEYS, { neutral: ['c'] })).toEqual({});
    expect(lensOrderStyle('c', KEYS, { beneficiary: ['c'] })).toEqual({
      '--lens-order-beneficiary': 0,
    });
  });

  it('ignores first keys that are not in the list', () => {
    expect(lensOrderStyle('a', KEYS, { trustee: ['zzz', 'c'] })).toEqual({
      '--lens-order-trustee': 1,
    });
  });
});
