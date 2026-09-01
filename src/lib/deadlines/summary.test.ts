import { describe, expect, it } from 'vitest';
import { computeDeadlines } from './compute';
import { buildSummary, describeStatus } from './summary';
import type { DeadlineResult, WizardAnswers } from './types';

const TODAY = '2026-09-01';

describe('buildSummary', () => {
  it('lists the answers and every result in plain text', () => {
    const answers: WizardAnswers = {
      deathDate: '2026-05-01',
      instrument: 'both',
      noticeServed: 'yes',
      noticeDate: '2026-05-24',
      trustCopy: 'received',
      trustCopyDate: '2026-08-22',
      probateStatus: 'admitted',
      probateDate: '2026-04-24',
      concerns: ['elder-abuse'],
      abuseDiscoveryDate: '2026-03-01',
    };
    const text = buildSummary(answers, computeDeadlines(answers, TODAY));
    expect(text).toContain('estimates, not legal advice');
    expect(text).toContain('Date of death: May 1, 2026');
    expect(text).toContain('Estate plan: Trust and will');
    expect(text).toContain('Trustee notice served: Yes, May 24, 2026');
    expect(text).toContain('Copy of trust received: Yes, August 22, 2026');
    expect(text).toContain('Will admitted to probate: Yes, April 24, 2026');
    expect(text).toContain('Concerns: Financial elder abuse');
    expect(text).toContain('First learned of abuse: March 1, 2026');
    expect(text).toContain(
      '- Contest the will (Probate Code § 8270): August 24, 2026, passed 8 days ago',
    );
    expect(text).toContain(
      '- Contest the trust (Probate Code § 16061.8): October 21, 2026, 50 days left',
    );
    expect(text).toContain(
      '- Financial elder abuse (Welfare & Institutions Code § 15657.7): March 1, 2030',
    );
    expect(text.endsWith('I would like to talk to a lawyer about these deadlines.')).toBe(true);
    expect(text).not.toContain('—');
  });

  it('skips blank answers and labels unstarted clocks', () => {
    const answers: WizardAnswers = {
      instrument: 'trust',
      noticeServed: 'no',
      concerns: [],
    };
    const text = buildSummary(answers, computeDeadlines(answers, TODAY));
    expect(text).not.toContain('Date of death');
    expect(text).toContain('Trustee notice served: No');
    expect(text).toContain('Concerns: None of the listed concerns');
    expect(text).toContain('clock not started');
  });
});

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
