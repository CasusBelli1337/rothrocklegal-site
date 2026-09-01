import { describe, expect, it } from 'vitest';
import { bindSectionSigns } from './typography';

const NBSP = ' ';

describe('bindSectionSigns', () => {
  it('glues a section sign to the number that follows it', () => {
    expect(bindSectionSigns('Probate Code § 16061.8 and §§ 16060–16062')).toBe(
      `Probate Code §${NBSP}16061.8 and §§${NBSP}16060–16062`,
    );
  });

  it('leaves prose without statute cites alone', () => {
    const text = 'A trustee must account. § alone stays.';
    expect(bindSectionSigns(text)).toBe(text);
  });
});
