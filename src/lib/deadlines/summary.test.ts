import { describe, expect, it } from 'vitest';
import { describeStatus } from './summary';
import type { DeadlineResult } from './types';

describe('describeStatus', () => {
  const make = (
    status: DeadlineResult['status'],
    daysRemaining: number | null,
  ): DeadlineResult => ({
    id: 'trust-contest',
    label: '',
    statute: '',
    statuteUrl: '',
    description: '',
    whyItMatters: '',
    deadline: null,
    daysRemaining,
    status,
    explanation: '',
    caveats: [],
  });

  it('reads naturally at every boundary', () => {
    expect(describeStatus(make('urgent', 0))).toBe('TODAY');
    expect(describeStatus(make('urgent', 1))).toBe('1 day left (urgent)');
    expect(describeStatus(make('urgent', 12))).toBe('12 days left (urgent)');
    expect(describeStatus(make('open', 45))).toBe('45 days left');
    expect(describeStatus(make('passed', -1))).toBe('passed yesterday');
    expect(describeStatus(make('passed', -8))).toBe('passed 8 days ago');
    expect(describeStatus(make('not-started', null))).toBe('clock not started');
  });
});
