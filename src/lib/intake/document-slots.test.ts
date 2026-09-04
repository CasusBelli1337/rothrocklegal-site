import { describe, expect, it } from 'vitest';
import { DOCUMENT_SLOTS } from './contract';
import { MAX_FILES, fileProblem, formatBytes, slotsForSituations } from './document-slots';

const keys = (situations: Parameters<typeof slotsForSituations>[0]) =>
  slotsForSituations(situations).map((s) => s.key);

describe('slotsForSituations', () => {
  it("always includes the 'all' slots, in catalog order", () => {
    expect(keys([])).toEqual(['correspondence', 'death-certificate', 'other-docs']);
  });

  it('adds the slots for one situation', () => {
    expect(keys(['business-disputes'])).toEqual([
      'correspondence',
      'death-certificate',
      'agreements',
      'other-docs',
    ]);
  });

  it('serves trustees and complex estates the fiduciary and asset slots', () => {
    const trustee = keys(['for-trustees']);
    for (const key of ['trust', 'trustee-notice', 'accounting', 'bank-statements', 'deeds'])
      expect(trustee).toContain(key);
    expect(trustee).not.toContain('agreements');
    expect(keys(['complex-estates'])).toContain('agreements');
  });

  it('unions several situations without duplicates, keeping catalog order', () => {
    const result = keys(['trust-contests', 'financial-elder-abuse']);
    expect(new Set(result).size).toBe(result.length);
    expect(result).toEqual(DOCUMENT_SLOTS.map((s) => s.key).filter((k) => result.includes(k)));
    expect(result).toContain('trust');
    expect(result).toContain('bank-statements');
    expect(result).not.toContain('agreements');
  });
});

describe('fileProblem', () => {
  it('accepts a normal PDF', () => {
    expect(fileProblem({ name: 'trust.PDF', size: 1024 }, 0)).toBeNull();
  });

  it('explains each limit in plain English', () => {
    expect(fileProblem({ name: 'a.pdf', size: 1 }, MAX_FILES)).toMatch(/up to 500 files/);
    expect(fileProblem({ name: 'virus.exe', size: 1 }, 0)).toMatch(/cannot read/);
    expect(fileProblem({ name: 'big.pdf', size: 96 * 1024 * 1024 }, 0)).toMatch(/over 95 MB/);
    expect(fileProblem({ name: 'ok.pdf', size: 94 * 1024 * 1024 }, 0)).toBeNull();
    expect(fileProblem({ name: 'empty.txt', size: 0 }, 0)).toMatch(/empty/);
  });
});

describe('formatBytes', () => {
  it('picks a readable unit', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });
});
